"use client";

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
import { Plus, Edit, Trash2, Undo, Redo, Receipt } from "lucide-react";
import { Quote } from "@/types/quote";
import { getQuotes, saveQuotes } from "@/app/actions/quoteActions";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "./ui/badge";
import { useRouter } from "next/navigation";
import { Hash, Calendar, List, DollarSign } from "lucide-react";

interface HistoryState {
  past: Quote[][];
  present: Quote[];
  future: Quote[][];
}

export default function QuoteBuilder() {
  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: [],
    future: [],
  });
  const { toast } = useToast();
  const router = useRouter();

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    const loadedQuotes = await getQuotes();
    setHistory({
      past: [],
      present: loadedQuotes,
      future: [],
    });
  };

  // Helper function to save state to history
  const saveToHistory = async (newPresent: Quote[]) => {
    setHistory((prev) => ({
      past: [...prev.past, prev.present],
      present: newPresent,
      future: [],
    }));
    await saveQuotes(newPresent);
  };

  const handleDelete = async (quoteToDelete: Quote) => {
    const updatedQuotes = history.present.filter(
      (q) => q.quoteId !== quoteToDelete.quoteId
    );

    await saveToHistory(updatedQuotes);

    toast({
      title: "Quote Deleted",
      description: "Use undo button to restore the quote",
    });
  };

  const handleUndo = async () => {
    if (!canUndo) return;

    const newPresent = history.past[history.past.length - 1];
    const newPast = history.past.slice(0, -1);

    setHistory({
      past: newPast,
      present: newPresent,
      future: [history.present, ...history.future],
    });

    await saveQuotes(newPresent);

    toast({
      title: "Action Undo",
      description: "The previous action has been undo",
    });
  };

  const handleRedo = async () => {
    if (!canRedo) return;

    const newPresent = history.future[0];
    const newFuture = history.future.slice(1);

    setHistory({
      past: [...history.past, history.present],
      present: newPresent,
      future: newFuture,
    });

    await saveQuotes(newPresent);

    toast({
      title: "Action Redone",
      description: "The action has been redone",
    });
  };

  // Add keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [history]);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <CardTitle>
              <p className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                Quote Management
              </p>
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleUndo}
                disabled={!canUndo}
                className="flex items-center"
              >
                <Undo className="w-4 h-4 mr-2" /> Undo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRedo}
                disabled={!canRedo}
                className="flex items-center"
              >
                <Redo className="w-4 h-4 mr-2" /> Redo
              </Button>
            </div>
          </div>
          <Link href="/quotes/new">
            <Button className="group mt-8 flex h-10 items-center justify-center rounded-md border border-orange-600 bg-gradient-to-b from-orange-400 via-orange-500 to-orange-600 px-4 text-neutral-50 shadow-[inset_0_1px_0px_0px_#fdba74] active:[box-shadow:none]">
              <Plus className="w-4 h-4 mr-2" /> Create New Quote
            </Button>
          </Link>
        </CardHeader>

        {history.present.length > 0 ? (
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
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.present.map((quote) => (
                  <TableRow
                    key={quote.quoteId}
                    onClick={() => router.push(`/quotes/${quote.quoteId}`)}
                    className="cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <TableCell>{quote.quoteId}</TableCell>
                    <TableCell>{quote.createdDate}</TableCell>
                    <TableCell>{quote.items.length}</TableCell>
                    <TableCell className="text-right">
                      <Badge className="border border-orange-500 bg-orange-500/20 text-black hover:bg-orange-500/30">
                        ${quote.totalPrice.toFixed(2)}
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
                          e.stopPropagation();
                          handleDelete(quote);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        ) : (
          <div className="text-center py-12">
            <div className="bg-orange-50 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
              <Receipt className="w-8 h-8 text-orange-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No Quotes Available
            </h3>
            <p className="text-gray-500">
              Create your first quote to get started
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
