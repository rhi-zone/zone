import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid(
  defineConfig({
    title: 'Flora',
    description: 'Full-stack Lua applications for the Rhizome ecosystem',

    themeConfig: {
      nav: [
        { text: 'Home', link: '/' },
        { text: 'Projects', link: '/projects/' },
        { text: 'Design', link: '/design/' },
      ],

      sidebar: {
        '/': [
          {
            text: 'Projects',
            items: [
              { text: 'Wisteria', link: '/projects/wisteria' },
              { text: 'Iris', link: '/design/iris' },
              { text: 'Seeds', link: '/projects/seeds' },
            ]
          },
          {
            text: 'Design',
            items: [
              { text: 'Iris', link: '/design/iris' },
            ]
          },
        ]
      },

      socialLinks: [
        { icon: 'github', link: 'https://github.com/rhizome-lab/flora' }
      ],

      search: {
        provider: 'local'
      },
    },

    vite: {
      optimizeDeps: {
        include: ['mermaid'],
      },
    },
  }),
)
