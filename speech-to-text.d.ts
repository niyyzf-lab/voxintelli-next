// speech-to-text.d.ts
declare module "speech-to-text" {
  interface ListeningOptions {
    lang?: string;
  }

  interface ListenResult {
    interimTranscript?: string;
    finalTranscript?: string;
  }

  function listen(
    onResult: (result: ListenResult) => void,
    onError: (error: any) => void,
    options?: ListeningOptions
  ): () => void;

  function stopListening(): void;
}
