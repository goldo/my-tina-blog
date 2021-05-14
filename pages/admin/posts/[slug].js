// pages/admin/posts/[slug].js
import { useRouter } from "next/router"
import React, { useEffect, useState } from "react"
import { useGraphqlForms } from "tina-graphql-gateway"
import markdownToHtml from "../../../lib/markdownToHtml"
import Post from "../../posts/[slug]"
export default function BlogPostEditor() {
  const query = (gql) => gql`
    query BlogPostQuery($relativePath: String!) {
      getPostsDocument(relativePath: $relativePath) {
        data {
          __typename
          ... on Post_Doc_Data {
            title
            excerpt
            coverImage
            date
            author {
              name
              picture
            }
            ogImage {
              url
            }
            _body
          }
        }
      }
    }
  `

  const router = useRouter()
  const [payload, isLoading] = useGraphqlForms({
    query,
    variables: { relativePath: `${router.query.slug}.md` },
    formify: ({ createForm, formConfig }) => {
      formConfig.fields?.forEach((field) => {
        //use markdown plugin with _body field
        if (field.name === "_body") {
          field.component = "markdown"
        }
      })
      return createForm(formConfig)
    },
  })

  const [content, setContent] = useState("")
  useEffect(() => {
    const parseMarkdown = async () => {
      let { _body } = payload?.getPostsDocument.data || ""
      setContent(await markdownToHtml(_body))
    }

    parseMarkdown()
  }, [payload?.getPostsDocument.data._body])

  if (isLoading) {
    return <p>Loading...</p>
  }

  let { _body, ...post } = payload.getPostsDocument.data
  post.slug = router.query.slug
  post.content = content
  return <Post post={post} />
}
