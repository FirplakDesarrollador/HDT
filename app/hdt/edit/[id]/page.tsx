import HdtForm from '../../../../components/HdtForm'

interface EditHdtPageProps {
    params: {
        id: string
    }
}

export default async function EditHdtPage({ params }: EditHdtPageProps) {
    const { id } = await params
    return (
        <HdtForm mode="edit" hdtId={id} />
    )
}
