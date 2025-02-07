"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Trash2, Edit, Plus, Save, ArrowLeft } from "lucide-react";
import { Quote, QuoteItem } from "@/types/quote";
import { getQuotes, saveQuotes } from "../../../actions/quoteActions";

export default function QuoteItemsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [editingItem, setEditingItem] = useState<QuoteItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<QuoteItem>>({
    name: "",
    description: "",
    price: 0,
  });

  useEffect(() => {
    const loadQuote = async () => {
      const quotes = await getQuotes();
      const foundQuote = quotes.find((q) => q.quoteId === params.id);
      if (foundQuote) {
        setQuote(foundQuote);
      }
    };
    loadQuote();
  }, [params.id]);

  const updateQuoteTotalPrice = (updatedQuote: Quote) => {
    return {
      ...updatedQuote,
      totalPrice: updatedQuote.items.reduce((sum, item) => sum + item.price, 0),
    };
  };

  const handleAddItem = async () => {
    if (!quote) return;

    if (!newItem.name || !newItem.description || newItem.price === undefined) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const newQuoteItem: QuoteItem = {
      id: `item${Date.now()}`,
      name: newItem.name,
      description: newItem.description,
      price: newItem.price,
    };

    const updatedQuote = updateQuoteTotalPrice({
      ...quote,
      items: [...quote.items, newQuoteItem],
    });

    const quotes = await getQuotes();
    const updatedQuotes = quotes.map((q) =>
      q.quoteId === updatedQuote.quoteId ? updatedQuote : q
    );

    const success = await saveQuotes(updatedQuotes);

    if (success) {
      setQuote(updatedQuote);
      setNewItem({ name: "", description: "", price: 0 });
      toast({
        title: "Success",
        description: "Item added successfully",
      });
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem || !quote) return;

    const updatedQuote = updateQuoteTotalPrice({
      ...quote,
      items: quote.items.map((item) =>
        item.id === editingItem.id ? editingItem : item
      ),
    });

    const quotes = await getQuotes();
    const updatedQuotes = quotes.map((q) =>
      q.quoteId === updatedQuote.quoteId ? updatedQuote : q
    );

    const success = await saveQuotes(updatedQuotes);

    if (success) {
      setQuote(updatedQuote);
      setEditingItem(null);
      toast({
        title: "Success",
        description: "Item updated successfully",
      });
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!quote) return;

    const updatedQuote = updateQuoteTotalPrice({
      ...quote,
      items: quote.items.filter((item) => item.id !== itemId),
    });

    const quotes = await getQuotes();
    const updatedQuotes = quotes.map((q) =>
      q.quoteId === updatedQuote.quoteId ? updatedQuote : q
    );

    const success = await saveQuotes(updatedQuotes);

    if (success) {
      setQuote(updatedQuote);
      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
    }
  };

  if (!quote) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.push("/")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <CardTitle>Quote Items - {quote.quoteId}</CardTitle>
          </div>
          <div className="text-sm text-muted-foreground">
            Total: ${quote.totalPrice.toFixed(2)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Item Name"
                value={editingItem?.name ?? newItem.name}
                onChange={(e) =>
                  editingItem
                    ? setEditingItem({ ...editingItem, name: e.target.value })
                    : setNewItem({ ...newItem, name: e.target.value })
                }
              />
              <Textarea
                placeholder="Description"
                className="md:col-span-2"
                value={editingItem?.description ?? newItem.description}
                onChange={(e) =>
                  editingItem
                    ? setEditingItem({
                        ...editingItem,
                        description: e.target.value,
                      })
                    : setNewItem({ ...newItem, description: e.target.value })
                }
              />
              <Input
                type="number"
                placeholder="Price"
                value={editingItem?.price ?? newItem.price}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  editingItem
                    ? setEditingItem({ ...editingItem, price: value })
                    : setNewItem({ ...newItem, price: value });
                }}
              />
            </div>
            <div className="flex justify-end">
              {editingItem ? (
                <Button onClick={handleUpdateItem}>
                  <Save className="w-4 h-4 mr-2" />
                  Update Item
                </Button>
              ) : (
                <Button onClick={handleAddItem}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              )}
            </div>
          </div>

          <div className="mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quote.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">
                      ${item.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingItem(item)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
