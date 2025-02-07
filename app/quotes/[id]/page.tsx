"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
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
import { Trash2, Edit, Plus, Save, ArrowLeft, Receipt } from "lucide-react";
import { Quote, QuoteItem } from "@/types/quote";
import { getQuotes, saveQuotes } from "@/app/actions/quoteActions";
import { useToast } from "@/hooks/use-toast";

export default function EditQuotePage() {
  const router = useRouter();
  const params = useParams();
  const quoteId = params?.id;

  const [quote, setQuote] = useState<Quote | null>(null);
  const [editingItem, setEditingItem] = useState<QuoteItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<QuoteItem>>({
    name: "",
    description: "",
    price: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    const loadQuote = async () => {
      const quotes = await getQuotes();
      let foundQuote = quotes.find((q) => q.quoteId === quoteId);

      if (!foundQuote) {
        foundQuote = {
          quoteId: `Q${Date.now().toString().slice(-5)}`,
          createdDate: new Date().toISOString().split("T")[0],
          totalPrice: 0,
          items: [],
        };
      }
      setQuote(foundQuote);
    };

    loadQuote();
  }, [quoteId]);

  const updateQuoteTotalPrice = (updatedQuote: Quote) => {
    return {
      ...updatedQuote,
      totalPrice: updatedQuote.items.reduce((sum, item) => sum + item.price, 0),
    };
  };

  const handleSaveQuote = async (updatedQuote?: Quote) => {
    if (!quote) return;

    let finalQuote = updatedQuote || quote;

    finalQuote.totalPrice = finalQuote.items.reduce(
      (sum, item) => sum + item.price,
      0
    );

    const quotes = await getQuotes();
    const existingQuoteIndex = quotes.findIndex(
      (q) => q.quoteId === finalQuote.quoteId
    );

    if (existingQuoteIndex !== -1) {
      quotes[existingQuoteIndex] = finalQuote;
    } else {
      quotes.push(finalQuote);
    }

    const success = await saveQuotes(quotes);

    if (success) {
      toast({ title: "Success", description: "Quote saved successfully" });
    }
  };

  const handleAddItem = async () => {
    if (
      !quote ||
      !newItem.name ||
      !newItem.description ||
      newItem.price === undefined
    ) {
      toast({
        title: "Validation Error",
        description: "Fill in all fields",
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

    setQuote(updatedQuote);
    await handleSaveQuote(updatedQuote);
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
    await handleSaveQuote(updatedQuote);
    setEditingItem(null);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!quote) return;

    const updatedQuote = updateQuoteTotalPrice({
      ...quote,
      items: quote.items.filter((item) => item.id !== itemId),
    });

    setQuote(updatedQuote);
    await handleSaveQuote(updatedQuote);
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
              {quoteId ? `Edit Quote ${quote.quoteId}` : "Create New Quote"}
            </CardTitle>
          </div>
          <div className="text-sm text-muted-foreground">
            Total: ${quote.totalPrice.toFixed(2)}
          </div>
        </CardHeader>
        <CardContent>
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
        <CardContent>
          <div className="space-y-4 pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p>Quote Items</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Input
                placeholder="Item Name"
                value={editingItem?.name ?? newItem.name}
                onChange={(e) =>
                  editingItem
                    ? setEditingItem({ ...editingItem, name: e.target.value })
                    : setNewItem({ ...newItem, name: e.target.value })
                }
              />
              <Input
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
              {editingItem ? (
                <Button
                  className="group mt-8 flex h-10 items-center justify-center rounded-md border border-orange-600 bg-gradient-to-b from-orange-400 via-orange-500 to-orange-600 px-4 text-neutral-50 shadow-[inset_0_1px_0px_0px_#fdba74] active:[box-shadow:none]"
                  onClick={handleUpdateItem}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Update Item
                </Button>
              ) : (
                <Button
                  onClick={handleAddItem}
                  className="group mt-8 flex h-10 items-center justify-center rounded-md border border-orange-600 bg-gradient-to-b from-orange-400 via-orange-500 to-orange-600 px-4 text-neutral-50 shadow-[inset_0_1px_0px_0px_#fdba74] active:[box-shadow:none]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              )}
            </div>
          </div>

          <div className="mt-6">
            {quote.items.length ? (
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
            ) : (
              <div className="text-center py-12">
                <div className="bg-orange-50 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
                  <Receipt className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  No Items Added
                </h3>
                <p className="text-gray-500">
                  Start by adding items to your quote
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
