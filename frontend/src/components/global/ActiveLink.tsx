import { useRouter } from 'next/router';
import Link from 'next/link';
import React, { ReactElement, ReactNode } from 'react';

interface ActiveLinkProps {
    children: ReactNode;
    href: string;
    [key: string]: any; // This line is to allow any other props passed
}

const ActiveLink = ({ children, href, ...props }: ActiveLinkProps): ReactElement => {
    const { asPath } = useRouter();

    // Ensure there's only one child with proper type
    const child = React.Children.only(children) as ReactElement;

    const childClone = React.cloneElement(child, {
        ...props,
        className: asPath === href ? `${child.props.className} active` : child.props.className,
    });

    return <Link href={href}>{childClone}</Link>;
};

export default ActiveLink;
