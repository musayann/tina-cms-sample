import React from "react";
import App from "next/app";
import { TinaCMS, TinaProvider } from "tinacms";
import {
  GithubClient,
  TinacmsGithubProvider,
} from "react-tinacms-github";
import AppForm from "forms/app";

import "styles/global.css";
import { CloudinaryMediaStore } from "plugins/mediaStore";
import withRouter from "next/dist/client/with-router";

import "styles/global.css";

class Site extends App {
  cms: TinaCMS;
  
  constructor(props) {
    super(props);

    const github = new GithubClient({
      proxy: "/api/proxy-github",
      authCallbackRoute: "/api/create-github-access-token",
      clientId: process.env.GITHUB_CLIENT_ID,
      baseRepoFullName: process.env.REPO_FULL_NAME, // e.g: tinacms/tinacms.org,
      baseBranch: process.env.BASE_BRANCH, // e.g. 'master' or 'main' on newer repos
    });

    /**
     * 1. Create the TinaCMS instance
     */
    this.cms = new TinaCMS({
      enabled: !!props.pageProps.preview,
      apis: {
        /**
         * 2. Register the GithubClient
         */
        github,
      },
      /**
       * 3. Register the Media Store
       */
      media: new CloudinaryMediaStore(),
      /**
       * 4. Use the Sidebar and Toolbar
       */
      sidebar: props.pageProps.preview,
      toolbar: props.pageProps.preview,
    });

    this.cms.plugins.add(
      AppForm(
        (slug) =>
          // this.props.router.push({
          //   pathname: "/editor/apps/[slug]",
          //   query: { slug },
          // })
          (window.location.href = `/editor/apps/${slug}`)
      )
    );
  }

  render() {
    const { Component, pageProps } = this.props;
    return (
      /**
       * 5. Wrap the page Component with the Tina and Github providers
       */
      <TinaProvider cms={this.cms}>
        <TinacmsGithubProvider
          onLogin={onLogin}
          onLogout={onLogout}
          error={pageProps.error}
        >
          {/**
           * 6. Add a button for entering Preview/Edit Mode
           */}
          <EditLink cms={this.cms} />
          <Component {...pageProps} />
        </TinacmsGithubProvider>
      </TinaProvider>
    );
  }
}

const onLogin = async () => {
  const token = localStorage.getItem("tinacms-github-token") || null;
  const headers = new Headers();

  if (token) {
    headers.append("Authorization", "Bearer " + token);
  }

  const resp = await fetch(`/api/preview`, { headers: headers });
  const data = await resp.json();

  if (resp.status == 200) window.location.href = window.location.pathname;
  else throw new Error(data.message);
};

export default withRouter(Site);

const onLogout = () => {
  return fetch(`/api/reset-preview`).then(() => {
    window.location.reload();
  });
};

export const EditLink = ({ cms }) => {
  return (
    <button
      onClick={() => cms.toggle()}
      className="text-white hover:bg-blue-700 cursor-pointer rounded-full bg-blue-400 px-5 z-50 py-3 font-bold text-xs fixed left-5 bottom-5"
    >
      {cms.enabled ? "Exit Edit Mode" : "Edit This Site"}
    </button>
  );
};
