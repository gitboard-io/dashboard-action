import * as core from "@actions/core";
import * as github from "@actions/github";
import {Caller, GitboardApiSdk} from "@codeaim/gitboard-api";
import axios from "axios";

async function run() {
  try {
    const username = core.getInput('username');
    const key = core.getInput('key');
    const githubToken = core.getInput('github-token');
    const status = core.getInput('status');
    console.log("Running post script", username, key, githubToken, status);
    const gitboardApiSdk =  new GitboardApiSdk(authenticatedAxios(`https://api.gitboard.io`, key))
    const response = await gitboardApiSdk.upsertJob({ username }, { username, id: `${github.context.payload.repository.full_name}-${github.context.job}`, url: github.context.payload.repository.html_url, name: github.context.payload.repository.full_name, access: github.context.payload["private"] ? "private" : "public", status: "success", updated: github.context.payload.repository["updated_at"] });
    console.log("upsertJob response", response);
    const context = JSON.stringify(github.context, undefined, 2);
    console.log(`The event context: ${context}`);
    const step = JSON.stringify(github.context["step"], undefined, 2);
    console.log(`The event context: ${step}`);
    const githubJson = JSON.stringify(github, undefined, 2);
    console.log(`The event context: ${githubJson}`);

  }
  catch (error) {
    core.setFailed(error.message);
  }
}

function authenticatedAxios(url: string, key: string): Caller {
  return {
    call: async (method: any, resource: any, path: string, body: any, pathParameters: any, queryParameters: any, multiQueryParameters: any, headers: any, config: any) => {
      const result = await axios(url + path, {
        method: method as any,
        data: body,
        params: { ...queryParameters, ...multiQueryParameters },
        headers: {
          ...headers,
          "X-Api-Key": `${key}`
        },
        transformResponse: [],
        ...config,
      });
      return {
        statusCode: result.status,
        body: result.data,
        headers: result.headers as any,
      };
    },
  };
}

run()