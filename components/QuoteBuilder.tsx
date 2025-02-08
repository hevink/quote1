"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Quote } from "@/types/quote";
import { getQuotes, deleteQuote } from "@/app/actions/quoteActions";
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
import { Plus, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

export default function Dashboard() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    const data = await getQuotes();
    setQuotes(data);
  };

  const handleDelete = async (quoteId: string) => {
    const success = await deleteQuote(quoteId);
    if (success) {
      toast({
        title: "Quote deleted",
        description: "The quote has been successfully deleted",
      });
      loadQuotes();
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Quote Management</CardTitle>
          <Button
            onClick={() => router.push("/quotes/new")}
            className="bg-gradient-to-r from-orange-500 to-orange-600"
          >
            <Plus className="w-4 h-4 mr-2" /> Create New Quote
          </Button>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quote ID</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total Price</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((quote) => (
                <TableRow key={quote.quoteId}>
                  <TableCell
                    className="cursor-pointer"
                    onClick={() => router.push(`/quotes/${quote.quoteId}`)}
                  >
                    {quote.quoteId}
                  </TableCell>
                  <TableCell
                    className="cursor-pointer"
                    onClick={() => router.push(`/quotes/${quote.quoteId}`)}
                  >
                    {quote.createdDate}
                  </TableCell>
                  <TableCell
                    className="cursor-pointer"
                    onClick={() => router.push(`/quotes/${quote.quoteId}`)}
                  >
                    {quote.items.length} items
                  </TableCell>
                  <TableCell
                    className="cursor-pointer"
                    onClick={() => router.push(`/quotes/${quote.quoteId}`)}
                  >
                    <Badge variant="secondary">
                      ${quote.totalPrice.toFixed(2)}
                    </Badge>
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(quote.quoteId)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
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
