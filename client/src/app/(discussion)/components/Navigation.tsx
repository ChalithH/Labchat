import Link from 'next/link'

type Breadcrumb = {
  name: string;
  href: string;
};

const Navigation = ({ breadcrumbs }: { breadcrumbs: Breadcrumb[] }) => {
  return (
    <div className="bg-blue-800 text-white px-4 py-2 rounded-xl inline-block">
    	{ breadcrumbs.map( (crumb, idx) => (
        	<span key={ idx }>
				<Link href={ crumb.href }>{ crumb.name }</Link>
				{ idx < breadcrumbs.length - 1 && <span className="mx-2">{ '>' }</span> }
			</span>
		)) }
    </div>
  )
}

export default Navigation;
