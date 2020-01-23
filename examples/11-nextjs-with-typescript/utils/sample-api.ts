import fetch from 'isomorphic-unfetch'

/* switch: { "-lib": ["dom"], "-types": ["node"] } */
export async function sampleFetchWrapper(
  input: RequestInfo,
  init?: RequestInit
) {
  try {
    const data = await fetch(input, init).then(res => res.json())
    return data
  } catch (err) {
    throw new Error(err.message)
  }
}
