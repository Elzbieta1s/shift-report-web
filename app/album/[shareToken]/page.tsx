type Props = {
  params: Promise<{
    shareToken: string
  }>
}

export default async function AlbumPage({ params }: Props) {
  const { shareToken } = await params

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f4f8fb',
        padding: 40,
        fontFamily: 'Arial',
      }}
    >
      <h1
        style={{
          color: '#00294b',
          fontSize: 40,
          marginBottom: 20,
        }}
      >
        Shift Report Album
      </h1>

      <p
        style={{
          color: '#355468',
          fontSize: 18,
        }}
      >
        Album token:
      </p>

      <code
        style={{
          background: '#ffffff',
          padding: 12,
          borderRadius: 8,
          display: 'inline-block',
          marginTop: 12,
        }}
      >
        {shareToken}
      </code>
    </main>
  )
}