"use client"

import { useState, useEffect } from "react"
import type { Item } from "@/types"

interface ItemFormProps {
  onSubmit: (item: Item) => void
  onCancel: () => void
  initialItem?: Item | null
}

export default function ItemForm({ onSubmit, onCancel, initialItem }: ItemFormProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (initialItem) {
      setName(initialItem.name)
      setDescription(initialItem.description)
      setPrice(initialItem.price.toString())
    }
  }, [initialItem])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validate form inputs
    if (!name.trim() || !description.trim() || !price.trim()) {
      setError("All fields are required")
      return
    }

    const priceValue = Number.parseFloat(price)
    if (isNaN(priceValue) || priceValue < 0) {
      setError("Price must be a positive number")
      return
    }

    // Submit the form data
    onSubmit({
      id: initialItem?.id || "",
      name: name.trim(),
      description: description.trim(),
      price: priceValue,
    })

    // Reset form fields
    setName("")
    setDescription("")
    setPrice("")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">{initialItem ? "Edit Item" : "Add New Item"}</h3>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter item name"
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          placeholder="Enter item description"
        />
      </div>
      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
          Price
        </label>
        <input
          type="number"
          id="price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          step="0.01"
          min="0"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter item price"
        />
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300"
        >
          {initialItem ? "Update" : "Add"}
        </button>
      </div>
    </form>
  )
}

