import HdtForm from '../../../../components/HdtForm'

interface ViewHdtPageProps {
    params: {
        id: string
    }
}

export default async function ViewHdtPage({ params }: ViewHdtPageProps) {
    const { id } = await params
    return (
        <HdtForm mode="view" hdtId={id} />
    )
}
