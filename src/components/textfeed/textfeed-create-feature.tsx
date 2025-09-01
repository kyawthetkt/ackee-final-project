'use client';

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "../solana/solana-provider";
import { useTextfeedProgram } from "./textfeed-data-access";

export default function TextFeedCreateFeature() {
  const { publicKey } = useWallet();
  const { createPostMutation } = useTextfeedProgram();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      if (!title || !description) {
        alert("Please fill in all fields");
        return;
      }
      if (createPostMutation.isPending) return;

      await createPostMutation.mutateAsync({ title, description });
      setTitle("");
      setDescription("");
    } catch (err: unknown) {
      if (err instanceof Error) {
          setError(err.message ?? "Failed to create post");
      } else {
        console.error('Unknown error', err)
      }
    }
  }

  return publicKey ? (
    <div className="p-6 rounded-lg shadow-md bg-background text-foreground border border-border mx-auto max-w-2xl mt-12">
      <h2 className="text-xl font-bold mb-6">New Post</h2>

      {error && (
        <div className="bg-destructive text-destructive-foreground p-3 rounded-md mb-4 text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-muted-foreground">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full px-4 py-2 border border-border rounded-md bg-card text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-muted-foreground">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full px-4 py-2 border border-border rounded-md bg-card text-card-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
          />
        </div>

        <button
          type="submit"
          disabled={createPostMutation.isPending}
          className="mt-3 w-full flex justify-center py-3 px-4 text-base font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"
        >
          {createPostMutation.isPending ? "Submitting..." : "Create Post"}
        </button>
      </form>
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-16">
        <div className="hero-content text-center">
          <WalletButton />
        </div>
      </div>
    </div>
  );
}
