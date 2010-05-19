/*
 * Copyright (C) 2010  Camptocamp
 *
 * This file is part of Studio
 *
 * Studio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Studio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Studio.  If not, see <http://www.gnu.org/licenses/>.
 */

OpenLayers.Util.extend(OpenLayers.Lang.fr, {

	'Cancel': "Annuler",
	'Apply': "Appliquer",
	'Name': "Nom",
	'Projection': "Projection",
	'Units': "Unités",
	'Resolution': "Résolution",
    'Scales': 'Echelles',
    'dpi': 'DPI',
	'Height': "Hauteur",
	'Width': "Largeur",
	'Attention': "Attention !",
	'Saving ...': "Enregistrement...",
	'Comment': "Commentaire",
	'not specified': "Non spécifié",
	'Color': "Couleur",
	'Symbol': "Symbole",
	'Symbol size': "Taille de symbole",
	'Angle': "Rotation",
	'Priority': "Priorité",
	'Position': "Position",
	'Column': "Attribut",
	'Value': "Valeur",
	'Manage datastore': "Données",
	'Manage mapfiles': "Mapfile",
	'Alias': "Alias",
	'Editable': "Editable",
	'Tooltip': "Tooltip",
	'Search': "Recherche",
	'add': "Ajouter",
	'Error': 'Erreur',
	'Status code': "Code d'état",

    // widgets/Chooser.js
    'createnewmapfile': "Créer un nouveau mapfile ...",
    'createnewMapFish': "Créer un nouveau MapFish ...",
    'createnewdatastore': "Créer une nouvelle source de donnée ...",
    'exportmapfile': "Exporter mapfile",
    'exportMapFish': "Exporter MapFish",
    'deletemapfile': "Supprimer mapfile",
	'delete datastore': "Supprimer source de données",
    'deleteMapFish': "Supprimer MapFish",
    'editmapfile': "Editer mapfile",
    'editdatastore': "Editer source de données",
    'editMapFish': "Editer MapFish",
    'DefaultName': "Nouveau",
    'discardmapfile': "Supprimer mapfile",
    'discardMapFish': "Supprimer MapFish",
    'Are you sure you want to discard this mapfile ?': "Voulez-vous réellement supprimer ce mapfile ?",
    'Are you sure you want to discard this MapFish ?': "Voulez-vous réellement supprimer ce MapFish ?",

    // MapfileMgr/AddLayerWindow.js
    'Add a LAYER': "Ajouter une couche",
    'From a datasource': "A partir d'une source de donnée",
    'Data store': "Entrepôt de données",
    'Data source': "Source de donnée",
    'Choose one source': "Choisissez une source",
    'Using an existing template': "A partir d'un modèle existant",
    'Layer template': "Modèle de couche",
    'Choose one template': "Choisissez un modèle",
    
    // widgets/DatastoreCombo.js
    'Choose one store': "Choisissez un entrepôt de données",
    'DataStore': "Entrepôt",
    
    // MapfileMgr/ClassificationWizard.js
    'Unique values': "Valeurs uniques",
    'Quantiles': "Quantiles",
    'Classification Wizard': "Assistant de classification",
    'Choose attribute': "Choisissez un attribut",
    'Choose method': "Choisissez une méthode",
    'Select a method...': "Sélectionnez une méthode",
    'First color': "Première couleur",
    'Last color': "Dernière couleur",
    'Choose interpolation': "Choisissez interpolation",
    'Choose a predefined palette': "Choisissez une palette prédéfinie",
    'Classify': "Classifier",
    'Number of classes': "Nombre de classes",
    "Classification didn't succed, probably due to a timeout. Status text: ": "La classification a échoué, ceci sûrement parce qu'elle dure trop longtemps. Information: ",
    
    
    // MapfileMgr/LayerPropertiesPanel.js
    'LAYER object properties': "Propriétés de l'objet LAYER",
    'Opacity': "Opacité",
    'Limit by scale': "Filtrage selon échelle",
    'WFS attributes': "Attributs WFS",
    'Check the attributes you would want to see in a GetFeature WFS request response.': "Sélectionnez les attributs que vous voulez voir apparaître dans une une réponse à une requête WFS GetFeature.",
    'Save mapfile': "Enregistrer mapfile",
    'Map Viewer': "Prévisualisation de carte",
    'Save mapfile and refresh map': "Enregistre mapfile et rafraîchit carte",
    'Show a bigger map': "Affiche une plus grande carte", 
    'Show a smaller map': "Affiche une plus petite carte",
    'Display selected layer': "Affiche uniquement couche sélectionnée",
    'Save as layer template': "Enregistre un modèle de couche",
    'classify using wizard': "Classifie à l'aide de l'assistant",
    'delete layer': "Supprimer couche",
    'move up class': "Monter cette classe",
    'move down class': "Descendre cette classe",
    'delete class': "Supprimer classe",
    'create new layer ...': "Créer une nouvelle couche...",
    'global properties': "Propriétés globales",
    'layers': "Couches",
    'create new class ...': "Créer une nouvelle classe...",
    'New class': "Nouvelle classe",
    'Label item': "Etiquette",
    
    // MapfileMgr/MapPropertiesPanel.js
    'MAP object properties': "Propriétés de l'objet MAP",
    'Maxsize': "Taille minimum",
    'Image color': "Couleur de fonds",
    'extent': "Extension",
    
    // MapfileMgr/Panel.js
    '<-- Back to mapfiles list': "&lt;-- Retour vers la liste de mapfiles",
    'There are unsaved changes !<br /> Are you sure you want to switch to another mapfile ?<br /> ': "Certains changements n'ont pas été sauvés ! <br /> Etes-vous sûr de vouloir sélectionner un autre mapfile ?<br />",
    'Delete confirmation': "Confirmation de suppression",
    'Are you sure that you want to delete this layer ?': "Etes-vous sûr de vouloir supprimer cette couche ? Pour voir les changements dans la carte, sauvegardez le mapfile.",
    'add a style to all classes': 'mise à jour global de style',

    // DataMgr/Panel.js
    'Parameters': "Propriétés",
    'Add a new datasource ...': "Ajouter une source de donnée ...",
    '<-- Back to datastores list': "<-- Retour vers la liste des sources de données",

    
    // MapfileMgr/SaveLayertemplateWindow.js
    'Save as layertemplate': "Enregistrer un modèle de couche",
    
    // MapfileMgr/Styler/ClassPropertiesPanel.js
    'CLASS object properties': "Propriétés de l'objet CLASS",
    'Add Stroke': "Ajouter trait",
    'Add a Stroke style': "Ajouter un style de trait",
    'Add Fill': "Ajouter remplissage",
    'Add a Fill style': "Ajouter un style de remplissage",
    'Add Point': "Ajouter point",
    'Add a Point style': "Ajoute un style de point",
    'Limit by condition': "Filtrage selon condition",
    'Labels': "Etiquettes",
    
    // MapfileMgr/Styler/FillStylePanel.js
    'Fill style': "Style de remplissage",
    
    // MapfileMgr/Styler/LabelStylePanel.js
    'auto': "Automatique",
    'follow': "Selon objet",
    'Font': "Police",
    'Size': "Taille",
    'Buffer': "Buffer",
    'Outline color': "Couleur contour",
    "Don't forget to set a value for labelitem at the layer level": "N'oubliez pas de définir l'attribut d'étiquette au niveau de la couche",
    
    // MapfileMgr/Styler/LimitByConditionPanel.js
    'Operator': "Opérateur",
    
    // MapfileMgr/Chooser.js
    'labelmapfile': "mapfile",
    'labelmapfiles': "mapfiles",
    
    // MapfileMgr/Styler/LimitByScalePanel.js
    'Min scale': "Ech. min",
    'Get from map': "Selon carte",
    'Max scale': "Ech. max",
    "Must be bigger than Min Scale (": "L'échelle maximum doit être supérieur à l'échelle minimum (",
    
    // MapfileMgr/Styler/PositionComboBox.js
    'upper left': "en haut à gauche",
    'upper center': "en haut au centre",
    'upper right': "en haut à droite",
    'center left': "au centre à gauche",
    'center center': "au milieu",
    'center right': "au centre à droite",
    'lower left': "en bas à gauche",
    'lower center': "en bas au centre",
    'lower right': "en bas à droite",
    	
    // MapfileMgr/Styler/StrokeStylePanel.js
    'Stroke style': "Style de trait",
    
    // MapfileMgr/Styler/WfsAttributesPanel.js
    'Alias (click to edit)': "Alias (sélectionner pour éditer)",
    
    // DataMgr/AddDatasourceWindow.js
    'Add a datasource': "Ajouter une source de données",
    'datasource': "Source de données",
    'Uploading file...': "Transfert de fichier...",

    //MapfileMgr/BboxPanel.js
    'MaxValueBiggerThanMin': 'La valeur max doit être plus grande que la valeur min',

    //MapFileMgr/StyleWizard.js
    'Style Wizard': 'Mise à jour de styles',
    'Update mode: ': 'Type mise à jour: ',
    'Select an update mode': 'Sélectionner un type de mise à jour',
    'Update existing classes': 'Mettre à jour classes existantes',
    'Add new classes': 'Ajouter nouvelles classes'
});
