import type { Item } from "@/types";
import { Edit, Trash2, Package, DollarSign } from "lucide-react";

interface ItemListProps {
  items: Item[];
  onEdit: (item: Item) => void;
  onDelete: (id: string) => void;
}

export default function ItemList({ items, onEdit, onDelete }: ItemListProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="group relative bg-white rounded-2xl overflow-hidden border border-gray-300 hover:shadow-md transition-all duration-300 hover:border-gray-400"
        >
          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={() => onEdit(item)}
              className="p-2 bg-white text-gray-600 hover:text-orange-500 rounded-full shadow-md hover:shadow-lg transition-all duration-300"
              aria-label="Edit item"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="p-2 bg-white text-gray-600 hover:text-red-500 rounded-full shadow-md hover:shadow-lg transition-all duration-300"
              aria-label="Delete item"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Package className="w-5 h-5 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">
                {item.name}
              </h3>
            </div>

            {item.description && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-2 h-10">
                {item.description}
              </p>
            )}

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-green-50 rounded-lg">
                    <DollarSign className="w-4 h-4 text-green-500" />
                  </div>
                  <span className="text-sm text-gray-500">Price</span>
                </div>
                <span className="text-xl font-bold text-gray-800">
                  $
                  {item.price.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
