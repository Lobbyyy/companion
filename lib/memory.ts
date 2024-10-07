import { Redis } from "@upstash/redis";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";

export type CompanionKey = {
  companionName: string;
  modelName: string;
  userId: string;
};

export class MemoryManager {
  private static instance: MemoryManager;
  private history: Redis;
  private vectorDBClient: PineconeClient;
  private index: any; // Type this properly based on Pinecone's types
  private indexName: string;

  private constructor() {
    this.history = Redis.fromEnv();
    this.vectorDBClient = new PineconeClient({
      apiKey: process.env.PINECONE_API_KEY!,
    });
    this.indexName = process.env.PINECONE_INDEX_NAME!;
  }

  private async getIndex() {
    if (!this.index) {
      this.index = this.vectorDBClient.Index(this.indexName);
    }
    return this.index;
  }

  public async vectorSearch(
    recentChatHistory: string,
    companionFileName: string
 ) {
    const PineconeClient = <PineconeClient>this.vectorDBClient;

    const pineconeIndex = PineconeClient.Index(
        process.env.PINECONE_INDEX_NAME! || ""
    );

    // creating the vector store
    const vectorStore = await PineconeStore.fromExistingIndex(
        new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY}),
        { pineconeIndex }
    );

    // finding similar docs
    const similarDocs = await vectorStore
        .similaritySearch(recentChatHistory, 3, { fileName: companionFileName})
        .catch((err) => {
            console.log("Failed to get vector search results", err);
        });

    return similarDocs;
  } 

    public static async getInstance(): Promise<MemoryManager>{
        if (!MemoryManager.instance) {
        MemoryManager.instance = new MemoryManager();
        }

        return MemoryManager.instance;
    }

    // function to create reddis companion key
    private generateRedisCompanionKey(companionKey: CompanionKey): string {
        return `${companionKey.companionName}-${companionKey.modelName}-${companionKey.userId}`;
    }

    //fucntion to writetohistory so our models can adapt to new information
    public async writeToHistory(text:string, companionKey: CompanionKey) {
        if (!companionKey || typeof companionKey.userId == "undefined") {
            console.log("Companion key set incorrectly");
            return "";
        }

        const key = this.generateRedisCompanionKey(companionKey);
        const result = await this.history.zadd(key,{
            score: Date.now(),
            member:text,
        });

        return result;
    }

    // function to read reddis history
    public async readLatestHistory(companionKey: CompanionKey): Promise<string>{
        if(!companionKey || typeof companionKey.userId == "undefined") {
            console.log("Companion key set incorrectly");
            return "";
        }
        
        const key = this.generateRedisCompanionKey(companionKey);
        let result = await this.history.zrange(key, 0, Date.now(), {
            byScore: true,
        });

        result = result.slice(-30).reverse();
        const recentChats = result.reverse().join("\n");
        return recentChats;
    }

    // function to see the chat history
    public async seedChatHistory(
        seedContent: string,
        delimiter: string = "\n",
        companionKey: CompanionKey
    ) {
        const key = this.generateRedisCompanionKey(companionKey);

        if(await this.history.exists(key)) {
            console.log("User already has chat history");
            return;
        }

        const content = seedContent.split(delimiter);
        let counter = 0;

        for (const line of content) {
            await this.history.zadd(key, {score: counter, member: line });
            counter +=1;
        }
    }
}