# showing my perspective on gadget chains 
#   (oversimplified, trimed, abstracted by a ton)

# FRONTEND
class Payload:
    pass
class HTTP_request:
    def __init__(self):
        self._heading: dict
        self._request_body: Payload

class DeserializedFlightPayload:
    def __init__(self, graph_object: dict = {
                "args": "<malicious code here>", # python -c "exec(\"print('bombaclat')\")"
                "action": "Gadget1"
            }
        ):
        self._graph_object: dict = graph_object

        

# BACKEND
    # server-side gadgets 
class Gadget:
    def calling_given_gadget(self, next_gadget):
        return
    
class Gadget:
    def __init__(self, job: str):
        self._job = job
        self._property: any
        self._next_gadget: function = None

    def do_their_job(self):
        print(self._job)
        return
    
    def calling_given_gadget(self, next_gadget: Gadget = None) -> Gadget:
        self._next_gadget = next_gadget
            # the return line only exists for the fancy linking notation, no needs to concern here :D
        return self._next_gadget 

    def run(self, payload: DeserializedFlightPayload):
        self.do_their_job()
        return self._next_gadget.run(payload)
        
class Sink(Gadget):
    def __init__(self, job):
        super().__init__(job)
        
    def run(self, payload: DeserializedFlightPayload):
            # NOTE: the gadget can access any data given in the incoming payload
        cmd: str = payload._graph_object["args"]
        self.do_their_job()
        print(f"\t[SHELL]: Executing malicious input functions -> {cmd}")

    # these are java sinks
# class Java_Runtime_exec         (Sink): pass 
# class Java_Child_process_exec   (Sink): pass
# class Java_Eval                 (Sink): pass


if __name__ != "__main__":
    exit()



    # minor setups
some_other_random_gadget = Gadget("bombaclat")
gadget1 = Gadget("Gadget1: im doing this (calling Gadget 2...)")
gadget2 = Gadget("Gadget2: im doing that (calling Gadget 3...)")
gadget3 = Gadget("Gadget4: im handling this (calling Gadget 4...)")
gadget4 = Gadget("Gadget3: im handling that (calling the sink...)")
sink    = Sink  ("   sink: I HAVE REACHED YOUR SINK, LIL BRO :D")

    # server-side control flow (do some mind bending things here) 
    # (NOTE: this is the intentional workflow in backend, being exploited by the attackers)
sink: Gadget =  gadget1.calling_given_gadget(
                    gadget2).calling_given_gadget(
                        gadget3).calling_given_gadget(
                            gadget4).calling_given_gadget(
                                sink
                            )

# server-side process

    # the http request
your_stupid_react_flight_payload: DeserializedFlightPayload = DeserializedFlightPayload(
    { # http request 
        "args": "<the reverse shell code (setup a socket)>",
        "action":  "Gadget1", # attackers intentionally call this function, suspecting it will leads to the shell (they were right though) 
    }

)
    # the http request, not being validated properly, being processed by the backend's control flow
def Deserialize(payload: DeserializedFlightPayload):
        # NOTE: payload can chose what runs next, it can eventually reach a sink

    payload_action: str = payload._graph_object["action"] 
    
        # i just put it here for fun, http request graph tree can be access by any gadget
    payload_args: str = payload._graph_object["args"]

        # NOTE: gadget are implicitly called in real scenarios, not explicit like this
    gadget_map: dict = { 
        "Gadget_i": some_other_random_gadget,
        # ...
        "Gadget1": gadget1, # attackers will seize this gadget first
        "Gadget2": gadget2, # then this
        "Gadget3": gadget3, # then this
        "Gadget4": gadget4, # then this
        "Gadget5": sink,    # bombaclat (process to reverse shell)
    }
    action: Gadget = gadget_map[payload_action]
    action.run(payload)


Deserialize(your_stupid_react_flight_payload)
    


    