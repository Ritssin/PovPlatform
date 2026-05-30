import { redirect } from "next/navigation";

export default function PoVRootPage({ params }: { params: { id: string } }) {
  redirect(`/pov/${params.id}/context`);
}
