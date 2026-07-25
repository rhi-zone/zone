import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid(
  defineConfig({
    title: 'zone',
    description: 'Full-stack Lua applications for the rhi.zone ecosystem',
    base: '/zone/',

    srcExclude: ['**/CLAUDE.md'],

    themeConfig: {
      nav: [
        { text: 'Home', link: '/' },
        { text: 'Projects', link: '/projects/' },
        { text: 'Design', link: '/design/' },
        { text: 'rhi', link: 'https://docs.rhi.zone/' },
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

      editLink: {
        pattern: 'https://github.com/rhi-zone/zone/edit/master/docs/:path',
        text: 'Edit this page on GitHub'
      },
    },

    vite: {
      optimizeDeps: {
        include: ['mermaid'],
      },
    },
  }),
)
