
def input_guardril_node(state):

    input_text = state.get("input")

    blocked_words = ["bomb" , "weapon", "drug"]

    for word in blocked_words:
        if word in input_text:
            return {"blocked" : True, "reason" : "Identified malicious intent"}

        return {"blocked" : False}

