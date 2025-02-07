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
import { getQuotes, saveQuotes } from "../../actions/quoteActions";

export default function EditQuotePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [editingItem, setEditingItem] = useState<QuoteItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<QuoteItem>>({
    name: "",
    description: "",
    price: 0,
  });

  console.log(params);

  useEffect(() => {
    const loadQuote = async () => {
      const quotes = await getQuotes();
      const foundQuote = quotes.find((q) => q.quoteId === params.id);
      if (foundQuote) {
        setQuote(foundQuote);
      } else if (params.id === "new") {
        setQuote({
          quoteId: `Q${Date.now().toString().slice(-5)}`,
          createdDate: new Date().toISOString().split("T")[0],
          totalPrice: 0,
          items: [],
        });
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

  const handleSaveQuote = async () => {
    if (!quote) return;

    const quotes = await getQuotes();
    const updatedQuotes =
      params.id === "new"
        ? [...quotes, quote]
        : quotes.map((q) => (q.quoteId === quote.quoteId ? quote : q));

    const success = await saveQuotes(updatedQuotes);

    if (success) {
      toast({
        title: "Success",
        description: "Quote saved successfully",
      });
    }
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

    console.log(newQuoteItem, "newQuoteItem");

    const updatedQuote = updateQuoteTotalPrice({
      ...quote,
      items: [...quote.items, newQuoteItem],
    });

    console.log(updatedQuote, "updatedQuote");

    setQuote(updatedQuote);
    await handleSaveQuote();
    setNewItem({ name: "", description: "", price: 0 });
  };

  const handleUpdateItem = async () => {
    if (!editingItem || !quote) return;

    const updatedQuote = updateQuoteTotalPrice({
      ...quote,
      items: quote.items.map((item) =>
        item.id === editingItem.id ? editingItem : item
      ),
    });

    setQuote(updatedQuote);
    await handleSaveQuote();
    setEditingItem(null);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!quote) return;

    const updatedQuote = updateQuoteTotalPrice({
      ...quote,
      items: quote.items.filter((item) => item.id !== itemId),
    });

    setQuote(updatedQuote);
    await handleSaveQuote();
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
            <CardTitle>
              {params.id === "new"
                ? "Create New Quote"
                : `Edit Quote ${quote.quoteId}`}
            </CardTitle>
          </div>
          <div className="text-sm text-muted-foreground">
            Total: ${quote.totalPrice.toFixed(2)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Quote ID</label>
              <Input value={quote.quoteId} disabled />
            </div>
            <div>
              <label className="text-sm font-medium">Created Date</label>
              <Input
                type="date"
                value={quote.createdDate}
                onChange={(e) => {
                  setQuote({ ...quote, createdDate: e.target.value });
                  handleSaveQuote();
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quote Items</CardTitle>
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
