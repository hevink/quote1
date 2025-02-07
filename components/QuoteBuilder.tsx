// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import ItemForm from "./ItemForm";
// import ItemList from "./ItemList";
// import type { Item } from "@/types";
// import { PlusCircle, Receipt } from "lucide-react";
// import Modal from "./Modal";

// export default function QuoteBuilder() {
//   const router = useRouter();
//   const [items, setItems] = useState<Item[]>([]);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingItem, setEditingItem] = useState<Item | null>(null);
//   const [isMounted, setIsMounted] = useState(false); // Fix hydration issue

//   // Load items from localStorage on first mount
//   useEffect(() => {
//     const storedItems = localStorage.getItem("quoteItems");
//     if (storedItems) {
//       setItems(JSON.parse(storedItems));
//     }
//     setIsMounted(true); // Ensures hydration is complete
//   }, []);

//   // Save items to localStorage when items change (only if mounted)
//   useEffect(() => {
//     if (isMounted) {
//       localStorage.setItem("quoteItems", JSON.stringify(items));
//     }
//   }, [items, isMounted]);

//   // Handler for adding a new item
//   const addItem = (item: Item) => {
//     if (
//       items.some(
//         (existingItem) =>
//           existingItem.name.toLowerCase() === item.name.toLowerCase()
//       )
//     ) {
//       alert("An item with this name already exists.");
//       return;
//     }

//     const newItems = [...items, { ...item, id: Date.now().toString() }];
//     setItems(newItems);
//     closeModal();
//   };

//   // Handler for updating an existing item
//   const updateItem = (updatedItem: Item) => {
//     if (
//       items.some(
//         (existingItem) =>
//           existingItem.id !== updatedItem.id &&
//           existingItem.name.toLowerCase() === updatedItem.name.toLowerCase()
//       )
//     ) {
//       alert("An item with this name already exists.");
//       return;
//     }

//     const updatedItems = items.map((item) =>
//       item.id === updatedItem.id ? updatedItem : item
//     );
//     setItems(updatedItems);
//     closeModal();
//   };

//   // Handler for deleting an item
//   const deleteItem = (id: string) => {
//     const filteredItems = items.filter((item) => item.id !== id);
//     setItems(filteredItems);
//   };

//   // Handler for opening the edit modal
//   const openEditModal = (item: Item) => {
//     setEditingItem(item);
//     setIsModalOpen(true);
//   };

//   // Handler for closing the modal
//   const closeModal = () => {
//     setIsModalOpen(false);
//     setEditingItem(null);
//   };

//   // Calculate the total cost of all items
//   const totalCost = items.reduce((sum, item) => sum + item.price, 0);

//   return (
//     <div className="space-y-8 min-h-screen shadow-xl p-4 sm:p-6 md:p-8">
//       <div className="flex justify-between items-center">
//         <h2 className="text-3xl font-semibold text-gray-800">Quote Items</h2>
//         <button
//           // onClick={() => setIsModalOpen(true)}
//           onClick={() => router.push("/add-quote")}
//           className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-300 shadow-md"
//         >
//           <PlusCircle className="w-5 h-5 mr-2" />
//           Add Item
//         </button>
//       </div>
//       {items[0] ? (
//         <ItemList items={items} onEdit={openEditModal} onDelete={deleteItem} />
//       ) : (
//         <div className="text-center py-12">
//           <div className="bg-orange-50 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
//             <Receipt className="w-8 h-8 text-blue-500" />
//           </div>
//           <h3 className="text-lg font-semibold text-gray-800 mb-2">
//             No Items Added
//           </h3>
//           <p className="text-gray-500">Start by adding items to your quote</p>
//         </div>
//       )}
//       <div className="text-3xl font-bold text-gray-800 text-right">
//         Total Cost: ${totalCost.toFixed(2)}
//       </div>
//       <Modal isOpen={isModalOpen} onClose={closeModal}>
//         <ItemForm
//           onSubmit={editingItem ? updateItem : addItem}
//           initialItem={editingItem}
//           onCancel={closeModal}
//         />
//       </Modal>
//     </div>
//   );
// }

"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { Plus, Edit, Trash2, Undo } from "lucide-react";
import { Quote } from "@/types/quote";
import { getQuotes, saveQuotes } from "@/app/actions/quoteActions";
import Link from "next/link";

export default function QuoteBuilder() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [deletedQuote, setDeletedQuote] = useState<Quote | null>(null);
  const [undoTimer, setUndoTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    const loadedQuotes = await getQuotes();
    setQuotes(loadedQuotes);
  };

  const handleDelete = async (quoteToDelete: Quote) => {
    // Save the current state for potential undo
    setDeletedQuote(quoteToDelete);

    // Remove quote from the list
    const updatedQuotes = quotes.filter(
      (q) => q.quoteId !== quoteToDelete.quoteId
    );
    setQuotes(updatedQuotes);

    // Save to file
    await saveQuotes(updatedQuotes);

    // Show toast with undo option
    toast({
      title: "Quote Deleted",
      description: "Quote will be permanently deleted in 5 seconds",
      action: (
        <Button
          variant="outline"
          size="sm"
          onClick={handleUndo}
          className="flex items-center"
        >
          <Undo className="w-4 h-4 mr-2" />
          Undo
        </Button>
      ),
      duration: 5000,
    });

    // Clear any existing timer
    if (undoTimer) clearTimeout(undoTimer);

    // Set new timer for 5 seconds
    const timer = setTimeout(() => {
      setDeletedQuote(null);
    }, 5000);

    setUndoTimer(timer);
  };

  const handleUndo = async () => {
    if (!deletedQuote) return;

    // Clear the timer
    if (undoTimer) clearTimeout(undoTimer);

    // Restore the quote
    const updatedQuotes = [...quotes, deletedQuote];
    setQuotes(updatedQuotes);
    await saveQuotes(updatedQuotes);

    // Clear the deleted quote state
    setDeletedQuote(null);
    setUndoTimer(null);

    toast({
      title: "Quote Restored",
      description: "The quote has been restored successfully",
    });
  };

  useEffect(() => {
    // Cleanup timer on component unmount
    return () => {
      if (undoTimer) clearTimeout(undoTimer);
    };
  }, [undoTimer]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Quote Management</CardTitle>
          <Link href="/quotes/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create New Quote
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quote ID</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Items Count</TableHead>
                <TableHead className="text-right">Total Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((quote) => (
                <TableRow key={quote.quoteId}>
                  <TableCell>{quote.quoteId}</TableCell>
                  <TableCell>{quote.createdDate}</TableCell>
                  <TableCell>{quote.items.length}</TableCell>
                  <TableCell className="text-right">
                    ${quote.totalPrice.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link href={`/quotes/${quote.quoteId}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(quote)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
