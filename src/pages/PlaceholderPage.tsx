export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {title}
        </h1>
        <p className="text-muted-foreground">Esta página está em construção.</p>
      </div>
    </div>
  )
}
