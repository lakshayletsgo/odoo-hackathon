import EnhancedVenueForm from "@/components/enhanced-venue-form"

interface EditVenuePageProps {
  params: Promise<{ id: string }>
}

export default async function EditVenuePage({ params }: EditVenuePageProps) {
  const { id } = await params
  
  return <EnhancedVenueForm venueId={id} isEdit={true} />
}
