import { createClient } from "@/lib/supabase";
import { Quote } from "@/types/quote";

export async function getQuotes(): Promise<Quote[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .order("created_date", { ascending: false });

  if (error) {
    console.error("Error fetching quotes:", error);
    return [];
  }

  return (
    data?.map((item) => ({
      quoteId: item.quote_id,
      createdDate: item.created_date,
      totalPrice: item.total_price,
      items: item.items || [],
    })) || []
  );
}

export async function getQuoteById(quoteId: string): Promise<Quote | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .eq("quote_id", quoteId)
    .single();

  if (error || !data) {
    console.error("Error fetching quote:", error);
    return null;
  }

  return {
    quoteId: data.quote_id,
    createdDate: data.created_date,
    totalPrice: data.total_price,
    items: data.items || [],
  };
}

export async function saveQuote(quote: Quote): Promise<boolean> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("quotes")
    .upsert({
      quote_id: quote.quoteId,
      created_date: quote.createdDate,
      total_price: quote.totalPrice,
      items: quote.items,
    })
    .select();

  if (error) {
    console.error("Error saving quote:", error);
    return false;
  }

  return true;
}

export async function deleteQuote(quoteId: string): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from("quotes")
    .delete()
    .eq("quote_id", quoteId);

  if (error) {
    console.error("Error deleting quote:", error);
    return false;
  }

  return true;
}
