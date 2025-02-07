"use client";;
import { useEffect, useState } from "react";
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
import { Plus, Edit, Trash2, Undo, Receipt } from "lucide-react";
import { Quote } from "@/types/quote";
import { getQuotes, saveQuotes } from "@/app/actions/quoteActions";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "./ui/badge";
import { useRouter } from "next/navigation";
import { Hash, Calendar, List, DollarSign } from "lucide-react";

export default function QuoteBuilder() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [deletedQuote, setDeletedQuote] = useState<Quote | null>(null);
  const [undoTimer, setUndoTimer] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    const loadedQuotes = await getQuotes();
    setQuotes(loadedQuotes);
  };

  const handleDelete = async (quoteToDelete: Quote) => {
    setDeletedQuote(quoteToDelete); // Save current state for undo

    const updatedQuotes = quotes.filter(
      (q) => q.quoteId !== quoteToDelete.quoteId
    );
    setQuotes(updatedQuotes);
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
          <Undo className="w-4 h-4 mr-2" /> Undo
        </Button>
      ),
      duration: 5000,
    });

    if (undoTimer) clearTimeout(undoTimer);

    // Start a timer to clear deletedQuote after 5 seconds
    const timer = setTimeout(() => setDeletedQuote(null), 5000);
    setUndoTimer(timer);
  };

  const handleUndo = async () => {
    if (!deletedQuote) return;

    if (undoTimer) clearTimeout(undoTimer);

    const restoredQuotes = [...quotes, deletedQuote];
    setQuotes(restoredQuotes);
    await saveQuotes(restoredQuotes);

    setDeletedQuote(null);
    setUndoTimer(null);

    toast({
      title: "Quote Restored",
      description: "The quote has been restored successfully",
    });
  };

  useEffect(() => {
    return () => {
      if (undoTimer) clearTimeout(undoTimer);
    };
  }, [undoTimer]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            <p className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              Quote Management
            </p>
          </CardTitle>
          <Link href="/quotes/new">
            <Button className="group mt-8 flex h-10 items-center justify-center rounded-md border border-orange-600 bg-gradient-to-b from-orange-400 via-orange-500 to-orange-600 px-4 text-neutral-50 shadow-[inset_0_1px_0px_0px_#fdba74] active:[box-shadow:none]">
              <Plus className="w-4 h-4 mr-2" /> Create New Quote
            </Button>
          </Link>
        </CardHeader>
        {quotes[0] ? (
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      <Hash className="w-4 h-4" />
                      Quote ID
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Created Date
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      <List className="w-4 h-4" />
                      Items Count
                    </div>
                  </TableHead>
                  <TableHead className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <DollarSign className="w-4 h-4" />
                      Total Price
                    </div>
                  </TableHead>
                  <TableHead className="text-right">
                    <div className="flex justify-center gap-1">
                      Actions
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.map((quote) => {
                  const router = useRouter();

                  return (
                    <TableRow
                      key={quote.quoteId}
                      onClick={() => router.push(`/quotes/${quote.quoteId}`)}
                      className="cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <TableCell>{quote.quoteId}</TableCell>
                      <TableCell>{quote.createdDate}</TableCell>
                      <TableCell>{quote.items.length}</TableCell>
                      <TableCell className="text-center">
                        <Badge className="border border-orange-500 bg-orange-500/20 text-black hover:bg-orange-500/30">
                          {quote.totalPrice.toFixed(2)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Link href={`/quotes/${quote.quoteId}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Edit className="w-4 h-4 mr-2" /> Edit
                          </Button>
                        </Link>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent redirect
                            handleDelete(quote);
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        ) : (
          <div className="text-center py-12">
            <div className="bg-orange-50 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
              <Receipt className="w-8 h-8 text-orange-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No Items Added
            </h3>
            <p className="text-gray-500">Start by adding items to your quote</p>
          </div>
        )}
      </Card>
    </div>
  );
}
