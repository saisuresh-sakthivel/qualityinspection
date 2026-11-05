import { redirect } from "next/navigation";

/**
 * There is no home screen. Signed-in visits to `/` continue to the batch list.
 */
export default function HomePage() {
  redirect("/batches");
}
