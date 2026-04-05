import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

export async function POST(request: Request) {
  try {
    // Admin client to bypass RLS for public webhook ingestion
    const supabaseAdmin = createClient<any>(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )
    
    const body = await request.json()

    // 1. Basic validation
    if (!body.email || !body.company_name) {
      return NextResponse.json({ error: 'Missing required fields: email and company_name are required' }, { status: 400 })
    }

    // 2. Find or Create Client
    let clientId = ''
    const { data: existingClient, error: searchError } = await supabaseAdmin
      .from('clients')
      .select('id')
      .eq('email', body.email)
      .maybeSingle()

    if (searchError) {
      console.error('Client search error:', searchError)
      return NextResponse.json({ error: 'Database error while parsing client' }, { status: 500 })
    }

    if (existingClient) {
      clientId = (existingClient as { id: string }).id
    } else {
      const { data: newClient, error: createError } = await supabaseAdmin
        .from('clients')
        .insert({
          company_name: body.company_name,
          contact_person: body.contact_person || null,
          email: body.email,
          phone: body.phone || null,
          is_active: true
        })
        .select()
        .single()

      if (createError || !newClient) {
        console.error('Client create error:', createError)
        return NextResponse.json({ error: 'Failed to create client' }, { status: 500 })
      }
      clientId = newClient.id
    }

    // 3. Create Deal Record
    const dealName = body.deal_name || `New Lead - ${body.company_name}`
    
    const { data: newDeal, error: dealError } = await supabaseAdmin
      .from('deals')
      .insert({
        client_id: clientId,
        deal_name: dealName,
        stage: 'lead',
        patch_type: body.patch_type || null,
        backing_type: body.backing_type || null,
        patch_width: body.patch_width ? parseFloat(body.patch_width) : null,
        patch_height: body.patch_height ? parseFloat(body.patch_height) : null,
        quantity: body.quantity ? parseInt(body.quantity, 10) : null,
        promo_code: body.promo_code || null,
        artwork_url: body.artwork_url || null,
        product_description: body.product_description || null,
        expected_close_date: body.expected_close_date || null,
        notes: body.notes || 'Imported via public webhook',
        currency: 'USD',
        is_archived: false
      })
      .select()
      .single()

    if (dealError || !newDeal) {
      console.error('Deal create error:', dealError)
      return NextResponse.json({ error: 'Failed to create deal' }, { status: 500 })
    }

    // 4. Optionally create activity log
    await supabaseAdmin
      .from('activities')
      .insert({
        deal_id: newDeal.id,
        event_type: 'other',
        note: 'Lead ingested via public API.',
        created_at: new Date().toISOString()
      })

    return NextResponse.json({ success: true, deal: newDeal }, { status: 201 })
  } catch (err: any) {
    console.error('Lead ingestion error:', err)
    return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 })
  }
}
