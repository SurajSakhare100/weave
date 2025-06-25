interface BreadcrumbProps {
  items: string[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <div className="text-[#6c4323] mb-8">
      {items.map((item, index) => (
        <span key={index}>
          {index > 0 && <span className="mx-2 text-[#b59c8a]">{">"}</span>}
          <span className={index === items.length - 1 ? "text-[#b59c8a]" : ""}>{item}</span>
        </span>
      ))}
    </div>
  )
}
