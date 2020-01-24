import * as React from 'react'
import { NextPageContext } from 'next'

import { User } from '../../interfaces'
import Layout from '../../components/Layout'
import ListDetail from '../../components/ListDetail'
import { isBrowser } from '../../utils/env'

type Props = {
  item?: User
  errors?: string
}

/* switch: { "-lib": ["dom"], "-types": ["node"] } */
class InitialPropsDetail extends React.Component<Props> {
  static getInitialProps = async ({
    query,
  }: NextPageContext) => {
    try {
      const { id } = query
      let item: any;

      if (isBrowser()) /* switch: { "-types": ["node"] } */ {
        item = await fetch(
          `http://localhost:3000/api/users/${Array.isArray(id) ? id[0] : id}`
        ).then(res => res.json())
      } else /* switch: { "-lib": ["dom"] } */ {
        item = await fetch(
          `http://localhost:3000/api/users/${Array.isArray(id) ? id[0] : id}`
        ).then(res => res.json())
      }

      return { item }
    } catch (err) {
      return { errors: err.message }
    }
  }

  render() {
    const { item, errors } = this.props

    if (errors) {
      return (
        <Layout title={`Error | Next.js + TypeScript Example`}>
          <p>
            <span style={{ color: 'red' }}>Error:</span> {errors}
          </p>
        </Layout>
      )
    }

    return (
      <Layout
        title={`${
          item ? item.name : 'User Detail'
        } | Next.js + TypeScript Example`}
      >
        {item && <ListDetail item={item} />}
      </Layout>
    )
  }
}

export default InitialPropsDetail
