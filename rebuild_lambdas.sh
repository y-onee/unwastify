#!/bin/bash

cd terraform

# Define lambda functions
LAMBDAS=(
    "get_pantry"
    "add_to_pantry"
    "delete_pantry_item"
    "delete_shopping_item"
    "generate_shopping_list"
    "get_shopping_list"
    "mark_as_bought"
    "mark_expired"
    "mark_wasted"
    "update_family_info"
    "post_confirmation"
)

# Build each lambda
for lambda in "${LAMBDAS[@]}"; do
    src_file="src/${lambda}.py"
    zip_file="lambdas/${lambda}.zip"
    
    if [ -f "$src_file" ]; then
        # Create zip file with the source
        zip -j "$zip_file" "$src_file" "layers/common_utils/python/decimal_helper.py" > /dev/null 2>&1
        echo "✓ Rebuilt $lambda"
    fi
done

echo "All Lambda packages rebuilt!"
