import * as React from 'react'

import { User } from '../interfaces'

type Props = {
  data: User
}

const ListItem: React.FunctionComponent<Props> = ({ data }) => (
  <a>
    {data.id}: {data.name}
  </a>
)

export default ListItem
