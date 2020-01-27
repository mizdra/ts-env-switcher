import { NextPage } from 'next'
import Link from 'next/link'
import nodeFetch from 'node-fetch'

import Layout from '../../components/Layout'
import List from '../../components/List'
import { User } from '../../interfaces'
import { isBrowser } from '../../utils/env'

type Props = {
  items: User[]
  pathname: string
}

const WithInitialProps: NextPage<Props> = ({ items, pathname }) => (
  <Layout title="Users List | Next.js + TypeScript Example">
    <h1>Users List</h1>
    <p>
      Example fetching data from inside <code>getInitialProps()</code>.
    </p>
    <p>You are currently on: {pathname}</p>
    <List items={items} />
    <p>
      <Link href="/">
        <a>Go home</a>
      </Link>
    </p>
  </Layout>
)

/* switch: { "-lib": ["dom"], "-types": ["node"] } */
WithInitialProps.getInitialProps = async ({
  pathname,
}) => {
  let items: User[];

  if (isBrowser()) /* switch: { "-types": ["node"] } */ {
    items = await fetch(
      'http://localhost:3000/api/users'
    ).then(res => res.json())
  } else /* switch: { "-lib": ["dom"] } */ {
    items = await fetch(
      'http://localhost:3000/api/users'
    ).then(res => res.json())
  }

  return { items, pathname }
}

export default WithInitialProps
