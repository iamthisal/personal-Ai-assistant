from dotenv import load_dotenv
import os

from langchain.agents import create_agent
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import  ChatOpenAI
from langchain_tavily import TavilySearch

from system_prompts import ROUTER_AGENT_SYSTEM_PROMPT, NEWS_AGENT_PROMPT, SCAM_PROMPT

load_dotenv()

openrouter_key = os.getenv("OPENROUTER_KEY")
openrouter_url = os.getenv("OPENROUTER_URL")

if openrouter_key and openrouter_url:
    llm = ChatOpenAI(
        model=os.getenv("OPENROUTER_MODEL", "openai/gpt-4.1-mini"),
        api_key=openrouter_key,
        base_url=openrouter_url,
        max_tokens=int(os.getenv("OPENROUTER_MAX_TOKENS", "1024")),
    )
else:
    llm = ChatOpenAI(
        model=os.getenv("OPENAI_MODEL", "gpt-4.1-mini-2025-04-14"),
        max_tokens=int(os.getenv("OPENAI_MAX_TOKENS", "1024")),
    )

def router_agent(state):

    prompt = ChatPromptTemplate.from_messages([
        ("system", ROUTER_AGENT_SYSTEM_PROMPT ),
        ("human", "{input}" )
    ])

    routing_chain = prompt | llm
    agent_category = routing_chain.invoke({"input" : state["input"]})

    return {"route" : agent_category.content}


def scam_agent(state):

    prompt = ChatPromptTemplate.from_messages([
        ("system", SCAM_PROMPT ),
        ("human", "{input}" )
    ])

    scam_chain = prompt | llm
    scam_response  = scam_chain.invoke({"input" : state["input"]})

    return {"response" : scam_response.content}



def news_agent(state):
    web_search_tool = TavilySearch(max_results=5)

    agent = create_agent(
        model=llm,
        system_prompt=NEWS_AGENT_PROMPT,
        tools=[web_search_tool]
    )

    result = agent.invoke({
         "messages" : [

             {
                "role" : "user",
                "content" : state["input"]
                }

         ]

      }
       )

    return {"response" : result["messages"][-1].content}













