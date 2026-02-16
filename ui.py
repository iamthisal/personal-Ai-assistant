import gradio as gr

from app import execute_graph


def chat(query):
    return execute_graph(query)


ui = gr.Interface(
    fn=chat,
    inputs=[gr.Textbox(lines=2 , placeholder="Ask about news")],
    outputs=gr.Textbox(lines=10),
    title="tHISAL'S Personal Assistant",
    description="tYPE anything you like"

)

ui.launch()


