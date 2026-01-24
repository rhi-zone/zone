import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid(
  defineConfig({
    title: 'Zone',
    description: 'Full-stack Lua applications for the rhi.zone ecosystem',

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
              { text: 'Servers Brainstorm', link: '/design/servers-brainstorm' },
              { text: 'Distilled Insights', link: '/design/distilled-insights' },
            ]
          },
        ]
      },

      socialLinks: [
        { icon: 'github', link: 'https://github.com/rhi-zone/zone' }
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
