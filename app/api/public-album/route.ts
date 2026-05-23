import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Missing album token' }, { status: 400 })
  }

  const { data: share, error: shareError } = await supabaseAdmin
    .from('public_album_shares')
    .select('game_id, expires_at')
    .eq('share_token', token)
    .maybeSingle()

  if (shareError || !share) {
    return NextResponse.json({ error: 'Album not found' }, { status: 404 })
  }

  if (share.expires_at && new Date(share.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Album link expired' }, { status: 410 })
  }

  const { data: game, error: gameError } = await supabaseAdmin
    .from('games')
    .select('id, opponent, game_date, team_name')
    .eq('id', share.game_id)
    .maybeSingle()

  if (gameError || !game) {
    return NextResponse.json({ error: 'Game not found' }, { status: 404 })
  }

  const { data: mediaRows, error: mediaError } = await supabaseAdmin
    .from('game_media')
    .select('id, file_url, media_type, created_at')
    .eq('game_id', share.game_id)
    .order('created_at', { ascending: false })

  if (mediaError) {
    return NextResponse.json({ error: 'Could not load album media' }, { status: 500 })
  }

  const media = await Promise.all(
    (mediaRows ?? []).map(async (item) => {
      const storagePath = getStoragePathFromMediaUrl(item.file_url)

      if (!storagePath) {
        return {
          ...item,
          signedUrl: item.file_url,
        }
      }

      const { data } = await supabaseAdmin.storage
        .from('game-media')
        .createSignedUrl(storagePath, 60 * 60)

      return {
        ...item,
        signedUrl: data?.signedUrl ?? null,
      }
    })
  )

  return NextResponse.json({
    game,
    media,
  })
}

function getStoragePathFromMediaUrl(fileUrl: string) {
  if (!fileUrl.startsWith('http')) return fileUrl

  const marker = '/game-media/'

  if (!fileUrl.includes(marker)) return null

  const pathWithQuery = fileUrl.split(marker)[1]
  const path = pathWithQuery.split('?')[0]

  return decodeURIComponent(path)
}