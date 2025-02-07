"use client";

import { useState } from "react";
import ItemForm from "./ItemForm";
import ItemList from "./ItemList";
import type { Item } from "@/types";
import { PlusCircle } from "lucide-react";
import Modal from "./Modal";

export default function QuoteBuilder() {
  const [items, setItems] = useState<Item[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  // Handler for adding a new item
  const addItem = (item: Item) => {
    // Check for duplicate item names
    if (
      items.some(
        (existingItem) =>
          existingItem.name.toLowerCase() === item.name.toLowerCase()
      )
    ) {
      alert("An item with this name already exists.");
      return;
    }

    setItems([...items, { ...item, id: Date.now().toString() }]);
    closeModal();
  };

  // Handler for updating an existing item
  const updateItem = (updatedItem: Item) => {
    setItems(
      items.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
    closeModal();
  };

  // Handler for deleting an item
  const deleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  // Handler for opening the edit modal
  const openEditModal = (item: Item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  // Handler for closing the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  // Calculate the total cost of all items
  const totalCost = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-semibold text-gray-800">Quote Items</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300 shadow-md"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Add Item
        </button>
      </div>
      <ItemList items={items} onEdit={openEditModal} onDelete={deleteItem} />
      <div className="text-3xl font-bold text-gray-800 text-right">
        Total Cost: ${totalCost.toFixed(2)}
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <ItemForm
          onSubmit={editingItem ? updateItem : addItem}
          initialItem={editingItem}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
}
