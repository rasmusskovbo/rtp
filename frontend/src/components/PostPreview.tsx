import Link from 'next/link';

// todo rewrite to tsx
const PostPreview = ({title, subtitle, author, date}: {title: string, subtitle: string, author: string, date: string}) => {
    return (
        <div className="post-preview">
            <Link href="/post">
                <div>
                    <h2 className="post-title">{title}</h2>
                    <h4 className="post-subtitle">{subtitle}</h4>
                </div>
            </Link>
            <p className="post-meta">
                Posted by&nbsp;
                <Link href="#!">
                    <span>{author}</span>
                </Link>
                &nbsp;on {date}
            </p>
        </div>
    )
}

export default PostPreview;
