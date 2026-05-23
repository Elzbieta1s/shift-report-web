type Props = {
  params: Promise<{
    shareToken: string
  }>
}

type AlbumMedia = {
  id: string
  file_url: string
  media_type: string
  signedUrl: string | null
}

export default async function AlbumPage({ params }: Props) {
  const { shareToken } = await params

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const res = await fetch(`${baseUrl}/api/public-album?token=${shareToken}`, {
    cache: 'no-store',
  })

  if (!res.ok) {
    return (
      <main style={{ padding: 40 }}>
        <h1>Album not found</h1>
        <p>This album link may be invalid or expired.</p>
      </main>
    )
  }

  const album = await res.json()

  const photos = album.media.filter(
    (item: AlbumMedia) => item.media_type === 'image'
  )

  const videos = album.media.filter(
    (item: AlbumMedia) => item.media_type === 'video'
  )

  return (
    <main style={{ minHeight: '100vh', background: '#f4f8fb', padding: 24 }}>
      <h1 style={{ color: '#00294b' }}>Shift Report Album</h1>

      <h2 style={{ color: '#00294b' }}>
        vs {album.game.opponent}
      </h2>

      <p style={{ color: '#355468' }}>
        {album.game.game_date}
      </p>

      <p style={{ color: '#355468' }}>
        {photos.length} photos • {videos.length} videos
      </p>

      <div
        style={{
          display: 'grid',
          gap: 16,
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          marginTop: 24,
        }}
      >
        {photos.map((item: AlbumMedia) =>
          item.signedUrl ? (
            <img
              key={item.id}
              src={item.signedUrl}
              alt="Game media"
              style={{
                width: '100%',
                borderRadius: 16,
                background: '#ffffff',
              }}
            />
          ) : null
        )}

        {videos.map((item: AlbumMedia) =>
          item.signedUrl ? (
            <video
              key={item.id}
              controls
              src={item.signedUrl}
              style={{
                width: '100%',
                borderRadius: 16,
                background: '#000000',
              }}
            />
          ) : null
        )}
      </div>
    </main>
  )
}