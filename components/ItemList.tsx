import type { Item } from "@/types"
import { Edit, Trash2 } from "lucide-react"

interface ItemListProps {
  items: Item[]
  onEdit: (item: Item) => void
  onDelete: (id: string) => void
}

export default function ItemList({ items, onEdit, onDelete }: ItemListProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
        >
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.name}</h3>
            <p className="text-gray-600 mb-4">{item.description}</p>
            <p className="text-2xl font-bold text-blue-600 mb-4">${item.price.toFixed(2)}</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => onEdit(item)}
                className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors duration-300"
                aria-label="Edit item"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors duration-300"
                aria-label="Delete item"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

