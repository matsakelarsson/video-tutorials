# Turns text into Kokoro phonemes with misaki. Reads one JSON request per line on stdin and
# answers each with one JSON string on stdout. lib/misaki.mjs starts this.
import functools
import json
import sys
import warnings

warnings.simplefilter('ignore', FutureWarning)

from misaki import en, espeak


@functools.cache
def converter(british):
    # eSpeak handles words missing from misaki's dictionary, such as product names.
    # Without a fallback, misaki leaves those words out.
    return en.G2P(trf=False, british=british, fallback=espeak.EspeakFallback(british=british))


for line in sys.stdin:
    request = json.loads(line)
    phonemes, _ = converter(request['british'])(request['text'])
    print(json.dumps(phonemes), flush=True)
