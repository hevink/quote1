"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Quote, QuoteItem } from "@/types/quote";
import { getQuoteById, saveQuote } from "@/app/actions/quoteActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function QuoteEditor() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [quote, setQuote] = useState<Quote>({
    quoteId: `Q${Date.now().toString().slice(-5)}`,
    createdDate: new Date().toISOString().split("T")[0],
    totalPrice: 0,
    items: [],
  });
  const [newItem, setNewItem] = useState<Partial<QuoteItem>>({
    name: "",
    description: "",
    price: 0,
  });

  useEffect(() => {
    if (params.id !== "new") {
      loadQuote();
    }
  }, [params.id]);

  const loadQuote = async () => {
    const data = await getQuoteById(params.id as string);
    if (data) {
      setQuote(data);
    }
  };

  const handleAddItem = () => {
    if (!newItem.name || !newItem.description || !newItem.price) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const item: QuoteItem = {
      id: `item${Date.now()}`,
      name: newItem.name,
      description: newItem.description,
      price: newItem.price,
    };

    const updatedQuote = {
      ...quote,
      items: [...quote.items, item],
      totalPrice: quote.totalPrice + item.price,
    };

    setQuote(updatedQuote);
    setNewItem({ name: "", description: "", price: 0 });
  };

  const handleDeleteItem = (itemId: string) => {
    const item = quote.items.find((i) => i.id === itemId);
    if (!item) return;

    const updatedQuote = {
      ...quote,
      items: quote.items.filter((i) => i.id !== itemId),
      totalPrice: quote.totalPrice - item.price,
    };

    setQuote(updatedQuote);
  };

  const handleSave = async () => {
    const success = await saveQuote(quote);
    if (success) {
      toast({
        title: "Success",
        description: "Quote saved successfully",
      });
      router.push("/");
    }
  };

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
          <div className="text-lg font-semibold">
            Total: ${quote.totalPrice.toFixed(2)}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
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
                onChange={(e) =>
                  setQuote({ ...quote, createdDate: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Add New Item</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Item Name"
                value={newItem.name}
                onChange={(e) =>
                  setNewItem({ ...newItem, name: e.target.value })
                }
              />
              <Input
                placeholder="Description"
                className="md:col-span-2"
                value={newItem.description}
                onChange={(e) =>
                  setNewItem({ ...newItem, description: e.target.value })
                }
              />
              <Input
                type="number"
                placeholder="Price"
                value={newItem.price}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    price: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="flex justify-end">
              <Button
                disabled={
                  !newItem.name || !newItem.description || !newItem.price
                }
                onClick={handleAddItem}
              >
                <Plus className="w-4 h-4 mr-2" /> Add Item
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Quote Items</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead></TableHead>
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
                        size="sm"
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

          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => router.push("/")}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Quote</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
