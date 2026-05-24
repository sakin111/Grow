import CompanyProfileById from "@/components/company/CompanyProfileById";



export default function CompanyProfilePage({ params }: { params: { id: string } }) {

  return (
    <div >
     <CompanyProfileById params={params}/>
    </div>
  )
}
