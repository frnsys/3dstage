#!/bin/bash

# Crop
for f in frames/*.png; do
    # `mogrify` is supposed to do this in place but
    # would not, strangely. So use `convert` instead
    convert "$f" -crop 200x200+856+200 +repage "$f"
done

convert -dispose previous -delay 2 -loop 0 frames/*.png out.gif
