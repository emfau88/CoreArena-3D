"""Convert the free AssetQuest demo to a shared-texture GLB.

Run with Blender --background --python tools/import-decoration.py -- SOURCE_DIR.
SOURCE_DIR is the extracted Forest_Kit_AssetQuest_Itch_FREE_DEMO directory.
"""
import bpy
import sys
from pathlib import Path
from mathutils import Vector

source = Path(sys.argv[sys.argv.index('--') + 1]).resolve()
output = Path(__file__).resolve().parents[1] / 'public/assets/assetquest'
output.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

materials = {}
for kind, filename in [('leaves', 'Forest_Pack_Atlas_1.tga'), ('solid', 'Forest_Pack_BaseColor.png')]:
    image = bpy.data.images.load(str(source / 'Textures' / filename))
    if kind == 'leaves':
        image.scale(1024, 1024)
    image.file_format = 'PNG'
    image.pack()
    material = bpy.data.materials.new('assetquest-' + kind)
    material.use_nodes = True
    material.use_backface_culling = False
    shader = material.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Roughness'].default_value = 1
    texture = material.node_tree.nodes.new('ShaderNodeTexImage')
    texture.image = image
    material.node_tree.links.new(texture.outputs['Color'], shader.inputs['Base Color'])
    if kind == 'leaves':
        material.node_tree.links.new(texture.outputs['Alpha'], shader.inputs['Alpha'])
        material.surface_render_method = 'DITHERED'
    materials[kind] = material

names = ['Birch_Tree_1', 'Blackberry_Bush_1b', 'Fern_1a', 'Forest_Grass_1',
         'Fly_Agaric_Group_1', 'Bay_Bolete_Group_1', 'Tree_Stump_1', 'Woodruff_Cluster_1']
for name in names:
    before = set(bpy.data.objects)
    bpy.ops.import_scene.fbx(filepath=str(source / 'Meshes_DEMO' / (name + '.fbx')))
    imported = set(bpy.data.objects) - before
    root = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(root)
    for obj in imported:
        if obj.parent is None:
            obj.parent = root
        if obj.type != 'MESH':
            continue
        obj.name = name + '-mesh'
        for slot in obj.material_slots:
            original = slot.material
            image_names = ' '.join(n.image.name for n in original.node_tree.nodes
                                  if n.type == 'TEX_IMAGE' and n.image) if original and original.use_nodes else ''
            text = ((original.name if original else '') + ' ' + image_names).lower()
            kind = 'leaves' if 'atlas' in text or 'plant' in text or 'foliage' in text else 'solid'
            print('MATERIAL', name, text, '=>', kind)
            slot.material = materials[kind]
    # Imported FBX meshes initially own the requested name; reclaim it after renaming them.
    root.name = name
    bpy.context.view_layer.update()
    points = [obj.matrix_world @ Vector(corner) for obj in imported if obj.type == 'MESH' for corner in obj.bound_box]
    print('BOUNDS', name, [round(max(p[i] for p in points)-min(p[i] for p in points), 3) for i in range(3)])

bpy.ops.export_scene.gltf(filepath=str(output / 'forest-details.glb'), export_format='GLB',
                         export_animations=False, export_image_format='AUTO', export_yup=True)
print('EXPORTED', output / 'forest-details.glb')
