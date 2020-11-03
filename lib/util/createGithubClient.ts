import { Octokit } from '@octokit/rest'

export function createGithubClient(token: string) {
  const options = {
    auth: `token ${token}`,
  }

  return new Octokit(options)
}
