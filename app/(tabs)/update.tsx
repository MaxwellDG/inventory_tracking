import { DropdownItem, EditSection } from "@/components/EditSection";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useToast } from "@/contexts/ToastContext";
import { useApiError } from "@/hooks/use-api-error";
import {
  useCreateLabelMutation,
  useDeleteLabelMutation,
  useGetLabelsQuery,
  useUpdateLabelMutation,
} from "@/redux/labels/apiSlice";
import {
  useCreateCategoryMutation,
  useCreateItemMutation,
  useDeleteCategoryMutation,
  useDeleteItemMutation,
  useGetInventoryQuery,
  useUpdateCategoryMutation,
  useUpdateItemMutation,
} from "@/redux/products/apiSlice";
import { RootState } from "@/redux/store";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";

export default function UpdateScreen() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { showError } = useApiError();
  const user = useSelector((state: RootState) => state.auth.user);
  const isAdmin = user?.role === "admin";

  const { data: inventoryData = [], isLoading, error } = useGetInventoryQuery();
  const { data: labelsData = [] } = useGetLabelsQuery();

  // Mutation hooks
  const [createCategory] = useCreateCategoryMutation();
  const [createItem] = useCreateItemMutation();
  const [deleteCategory] = useDeleteCategoryMutation();
  const [deleteItem] = useDeleteItemMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [updateItem] = useUpdateItemMutation();
  const [createLabel] = useCreateLabelMutation();
  const [updateLabel] = useUpdateLabelMutation();
  const [deleteLabel] = useDeleteLabelMutation();

  // New category dropdown state
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // New item dropdown state
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQuantity, setNewItemQuantity] = useState("");
  const [newItemUnit, setNewItemUnit] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Delete category dropdown state
  const [showDeleteCategory, setShowDeleteCategory] = useState(false);
  const [deleteCategoryName, setDeleteCategoryName] = useState("");

  // Edit category dropdown state
  const [showEditCategory, setShowEditCategory] = useState(false);
  const [selectedEditCategory, setSelectedEditCategory] = useState("");
  const [editCategoryName, setEditCategoryName] = useState("");

  // Delete item dropdown state
  const [showDeleteItem, setShowDeleteItem] = useState(false);
  const [selectedDeleteItemCategory, setSelectedDeleteItemCategory] =
    useState("");
  const [deleteItemName, setDeleteItemName] = useState("");

  // Edit item dropdown state
  const [showEditItem, setShowEditItem] = useState(false);
  const [selectedEditItemCategory, setSelectedEditItemCategory] = useState("");
  const [selectedEditItem, setSelectedEditItem] = useState("");
  const [editItemName, setEditItemName] = useState("");
  const [editItemPrice, setEditItemPrice] = useState("");

  // Label dropdown state
  const [showAddLabel, setShowAddLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [showEditLabel, setShowEditLabel] = useState(false);
  const [selectedEditLabel, setSelectedEditLabel] = useState("");
  const [editLabelName, setEditLabelName] = useState("");
  const [showDeleteLabel, setShowDeleteLabel] = useState(false);
  const [deleteLabelName, setDeleteLabelName] = useState("");

  // Section expanded/collapsed state
  const [isCategorySectionExpanded, setIsCategorySectionExpanded] =
    useState(false);
  const [isItemsSectionExpanded, setIsItemsSectionExpanded] = useState(false);
  const [isLabelsSectionExpanded, setIsLabelsSectionExpanded] = useState(false);

  // Get items for the selected edit category
  const editCategoryItems = selectedEditItemCategory
    ? inventoryData.find((cat) => cat.name === selectedEditItemCategory)
        ?.items || []
    : [];

  // Get items for the selected delete category
  const deleteCategoryItems = selectedDeleteItemCategory
    ? inventoryData.find((cat) => cat.name === selectedDeleteItemCategory)
        ?.items || []
    : [];

  const handleAddCategory = async () => {
    if (newCategoryName.trim()) {
      try {
        await createCategory({
          name: newCategoryName.trim(),
          items: [],
        }).unwrap();
        setNewCategoryName("");
        setShowAddCategory(false);
        showToast(t("inventoryEdit.categoryCreated"), "success");
      } catch (error) {
        const msg =
          (error as any)?.data?.message ||
          t("inventoryEdit.failedToAddCategory");
        showError(error, msg);
      }
    }
  };

  const handleAddItem = async () => {
    if (
      newItemName.trim() &&
      newItemQuantity.trim() &&
      newItemUnit.trim() &&
      selectedCategory
    ) {
      try {
        const categoryId = inventoryData.find(
          (cat) => cat.name === selectedCategory
        )?.id;
        if (!categoryId) {
          Alert.alert(
            t("inventoryEdit.error"),
            t("inventoryEdit.selectedCategoryNotFound")
          );
          return;
        }

        await createItem({
          name: newItemName.trim(),
          quantity: parseInt(newItemQuantity) || 0,
          type_of_unit: newItemUnit.trim(),
          ...(newItemPrice.trim() && { price: parseFloat(newItemPrice) }),
          category_id: categoryId,
        }).unwrap();

        // Reset form
        setNewItemName("");
        setNewItemQuantity("");
        setNewItemUnit("");
        showToast(t("inventoryEdit.itemCreated"), "success");
        setNewItemPrice("");
        setSelectedCategory("");
        setShowAddItem(false);
      } catch (error) {
        const msg =
          (error as any)?.data?.message || t("inventoryEdit.failedToAddItem");
        showError(error, msg);
      }
    } else {
      Alert.alert(
        t("inventoryEdit.error"),
        t("inventoryEdit.fillAllRequiredFields")
      );
    }
  };

  const handleDeleteCategory = async () => {
    if (deleteCategoryName.trim()) {
      const categoryToDelete = inventoryData.find(
        (cat) => cat.name === deleteCategoryName.trim()
      );
      if (categoryToDelete) {
        try {
          await deleteCategory(categoryToDelete.id).unwrap();
          setDeleteCategoryName("");
          setShowDeleteCategory(false);
          showToast(t("inventoryEdit.categoryDeleted"), "success");
        } catch (error) {
          const msg =
            (error as any)?.data?.message ||
            t("inventoryEdit.failedToDeleteCategory");
          showError(error, msg);
        }
      } else {
        Alert.alert(
          t("inventoryEdit.error"),
          t("inventoryEdit.categoryNotFound", {
            name: deleteCategoryName.trim(),
          })
        );
      }
    } else {
      Alert.alert(
        t("inventoryEdit.error"),
        t("inventoryEdit.enterCategoryNameToDelete")
      );
    }
  };

  const handleEditCategory = async () => {
    if (selectedEditCategory && editCategoryName.trim()) {
      const categoryToEdit = inventoryData.find(
        (cat) => cat.name === selectedEditCategory
      );
      if (categoryToEdit) {
        const nameExists = inventoryData.some(
          (cat) =>
            cat.name === editCategoryName.trim() && cat.id !== categoryToEdit.id
        );
        if (nameExists) {
          Alert.alert(
            t("inventoryEdit.error"),
            t("inventoryEdit.categoryNameExists")
          );
          return;
        }

        try {
          await updateCategory({
            ...categoryToEdit,
            name: editCategoryName.trim(),
          }).unwrap();
          setSelectedEditCategory("");
          setEditCategoryName("");
          setShowEditCategory(false);
          showToast(t("inventoryEdit.categoryUpdated"), "success");
        } catch (error) {
          const msg =
            (error as any)?.data?.message ||
            t("inventoryEdit.failedToUpdateCategory");
          showError(error, msg);
        }
      }
    } else {
      Alert.alert(
        t("inventoryEdit.error"),
        t("inventoryEdit.selectCategoryAndEnterName")
      );
    }
  };

  const handleEditItem = async () => {
    if (selectedEditItemCategory && selectedEditItem && editItemName.trim()) {
      const category = inventoryData.find(
        (cat) => cat.name === selectedEditItemCategory
      );
      const itemToEdit = category?.items.find(
        (item) => item.name === selectedEditItem
      );

      if (itemToEdit) {
        const allItems = inventoryData.flatMap((cat) => cat.items);
        const nameExists = allItems.some(
          (item) =>
            item.name === editItemName.trim() && item.id !== itemToEdit.id
        );
        if (nameExists) {
          Alert.alert(
            t("inventoryEdit.error"),
            t("inventoryEdit.itemNameExists")
          );
          return;
        }

        try {
          await updateItem({
            ...itemToEdit,
            name: editItemName.trim(),
            price: editItemPrice.trim() ? parseFloat(editItemPrice) : undefined,
          }).unwrap();
          setSelectedEditItemCategory("");
          setSelectedEditItem("");
          setEditItemName("");
          setEditItemPrice("");
          setShowEditItem(false);
          showToast(t("inventoryEdit.itemUpdated"), "success");
        } catch (error) {
          const msg =
            (error as any)?.data?.message ||
            t("inventoryEdit.failedToUpdateItem");
          showError(error, msg);
        }
      }
    } else {
      Alert.alert(
        t("inventoryEdit.error"),
        t("inventoryEdit.selectCategoryItemAndEnterName")
      );
    }
  };

  const handleDeleteItem = async () => {
    if (selectedDeleteItemCategory && deleteItemName.trim()) {
      const itemToDelete = deleteCategoryItems.find(
        (item) => item.name === deleteItemName.trim()
      );
      if (itemToDelete) {
        try {
          await deleteItem(itemToDelete.id).unwrap();
          setDeleteItemName("");
          setSelectedDeleteItemCategory("");
          setShowDeleteItem(false);
          showToast(t("inventoryEdit.itemDeleted"), "success");
        } catch (error) {
          const msg =
            (error as any)?.data?.message ||
            t("inventoryEdit.failedToDeleteItem");
          showError(error, msg);
        }
      } else {
        Alert.alert(
          t("inventoryEdit.error"),
          t("inventoryEdit.itemNotFound", { name: deleteItemName.trim() })
        );
      }
    } else {
      Alert.alert(
        t("inventoryEdit.error"),
        t("inventoryEdit.enterItemNameToDelete")
      );
    }
  };

  // Label handlers
  const handleAddLabel = async () => {
    if (newLabelName.trim()) {
      try {
        await createLabel({
          name: newLabelName.trim(),
        }).unwrap();
        setNewLabelName("");
        setShowAddLabel(false);
        showToast(t("inventoryEdit.labelCreated"), "success");
      } catch (error) {
        const msg =
          (error as any)?.data?.message || t("inventoryEdit.failedToAddLabel");
        showError(error, msg);
      }
    }
  };

  const handleEditLabel = async () => {
    if (selectedEditLabel && editLabelName.trim()) {
      const labelToEdit = labelsData.find(
        (label) => label.name === selectedEditLabel
      );
      if (labelToEdit) {
        const nameExists = labelsData.some(
          (label) =>
            label.name === editLabelName.trim() && label.id !== labelToEdit.id
        );
        if (nameExists) {
          Alert.alert(
            t("inventoryEdit.error"),
            t("inventoryEdit.labelNameExists")
          );
          return;
        }

        try {
          await updateLabel({
            id: labelToEdit.id,
            name: editLabelName.trim(),
          }).unwrap();
          setSelectedEditLabel("");
          setEditLabelName("");
          setShowEditLabel(false);
          showToast(t("inventoryEdit.labelUpdated"), "success");
        } catch (error) {
          const msg =
            (error as any)?.data?.message ||
            t("inventoryEdit.failedToUpdateLabel");
          showError(error, msg);
        }
      }
    } else {
      Alert.alert(
        t("inventoryEdit.error"),
        t("inventoryEdit.selectLabelAndEnterName")
      );
    }
  };

  const handleDeleteLabel = async () => {
    if (deleteLabelName.trim()) {
      const labelToDelete = labelsData.find(
        (label) => label.name === deleteLabelName.trim()
      );
      if (labelToDelete) {
        try {
          await deleteLabel(labelToDelete.id).unwrap();
          setDeleteLabelName("");
          setShowDeleteLabel(false);
          showToast(t("inventoryEdit.labelDeleted"), "success");
        } catch (error) {
          const msg =
            (error as any)?.data?.message ||
            t("inventoryEdit.failedToDeleteLabel");
          showError(error, msg);
        }
      } else {
        Alert.alert(
          t("inventoryEdit.error"),
          t("inventoryEdit.labelNotFound", {
            name: deleteLabelName.trim(),
          })
        );
      }
    } else {
      Alert.alert(
        t("inventoryEdit.error"),
        t("inventoryEdit.enterLabelNameToDelete")
      );
    }
  };

  // Category dropdown items
  const categoryDropdownItems: DropdownItem[] = [
    {
      title: t("inventoryEdit.addNewCategory"),
      isOpen: showAddCategory,
      onToggle: () => setShowAddCategory(!showAddCategory),
      renderContent: () => (
        <>
          <TextInput
            style={styles.input}
            placeholder={t("inventoryEdit.categoryNamePlaceholder")}
            placeholderTextColor="#999"
            value={newCategoryName}
            onChangeText={setNewCategoryName}
            autoCapitalize="words"
          />
          <TouchableOpacity
            style={[
              styles.addButton,
              !newCategoryName.trim() && styles.addButtonDisabled,
            ]}
            onPress={handleAddCategory}
            disabled={!newCategoryName.trim()}
          >
            <IconSymbol name="plus" size={16} color="white" />
            <ThemedText style={styles.addButtonText}>
              {t("inventoryEdit.addCategory")}
            </ThemedText>
          </TouchableOpacity>
        </>
      ),
    },
    {
      title: t("inventoryEdit.editCategory"),
      isOpen: showEditCategory,
      onToggle: () => {
        if (showEditCategory) {
          setSelectedEditCategory("");
          setEditCategoryName("");
        }
        setShowEditCategory(!showEditCategory);
      },
      renderContent: () => (
        <>
          <View style={styles.categorySelector}>
            <ThemedText style={styles.selectorLabel}>
              {t("inventoryEdit.selectCategoryToEdit")}
            </ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
            >
              {inventoryData.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryOption,
                    selectedEditCategory === category.name &&
                      styles.categoryOptionSelected,
                  ]}
                  onPress={() => setSelectedEditCategory(category.name)}
                >
                  <ThemedText
                    style={[
                      styles.categoryOptionText,
                      selectedEditCategory === category.name &&
                        styles.categoryOptionTextSelected,
                    ]}
                  >
                    {category.name}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <TextInput
            style={styles.input}
            placeholder={t("inventoryEdit.enterNewCategoryName")}
            placeholderTextColor="#999"
            value={editCategoryName}
            onChangeText={setEditCategoryName}
            autoCapitalize="words"
          />

          <TouchableOpacity
            style={[
              styles.addButton,
              (!selectedEditCategory || !editCategoryName.trim()) &&
                styles.addButtonDisabled,
            ]}
            onPress={handleEditCategory}
            disabled={!selectedEditCategory || !editCategoryName.trim()}
          >
            <ThemedText style={styles.addButtonText}>
              {t("inventoryEdit.updateCategory")}
            </ThemedText>
          </TouchableOpacity>
        </>
      ),
    },
    {
      title: t("inventoryEdit.deleteCategory"),
      isOpen: showDeleteCategory,
      onToggle: () => setShowDeleteCategory(!showDeleteCategory),
      renderContent: () => (
        <>
          <TextInput
            style={styles.input}
            placeholder={t("inventoryEdit.enterExactCategoryName")}
            placeholderTextColor="#999"
            value={deleteCategoryName}
            onChangeText={setDeleteCategoryName}
            autoCapitalize="words"
          />

          <TouchableOpacity
            style={[
              styles.deleteButton,
              !deleteCategoryName.trim() && styles.deleteButtonDisabled,
            ]}
            onPress={handleDeleteCategory}
            disabled={!deleteCategoryName.trim()}
          >
            <IconSymbol name="trash" size={16} color="white" />
            <ThemedText style={styles.deleteButtonText}>
              {t("inventoryEdit.deleteCategory")}
            </ThemedText>
          </TouchableOpacity>
        </>
      ),
    },
  ];

  // Item dropdown items
  const itemDropdownItems: DropdownItem[] = [
    {
      title: t("inventoryEdit.addNewItem"),
      isOpen: showAddItem,
      onToggle: () => {
        if (showAddItem) {
          setNewItemName("");
          setNewItemQuantity("");
          setNewItemUnit("");
          setNewItemPrice("");
          setSelectedCategory("");
        }
        setShowAddItem(!showAddItem);
      },
      renderContent: () => (
        <>
          <TextInput
            style={styles.input}
            placeholder={t("inventoryEdit.itemNamePlaceholder")}
            placeholderTextColor="#999"
            value={newItemName}
            onChangeText={setNewItemName}
            autoCapitalize="words"
          />

          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.inputHalf]}
              placeholder={t("inventoryEdit.quantityPlaceholder")}
              placeholderTextColor="#999"
              value={newItemQuantity}
              onChangeText={setNewItemQuantity}
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.input, styles.inputHalf]}
              placeholder={t("inventoryEdit.unitPlaceholder")}
              placeholderTextColor="#999"
              value={newItemUnit}
              onChangeText={setNewItemUnit}
              autoCapitalize="words"
            />
          </View>

          <TextInput
            style={styles.input}
            placeholder={t("inventoryEdit.pricePlaceholder")}
            placeholderTextColor="#999"
            value={newItemPrice}
            onChangeText={setNewItemPrice}
            keyboardType="numeric"
          />

          <View style={styles.categorySelector}>
            <ThemedText style={styles.selectorLabel}>
              {t("inventoryEdit.selectCategory")}
            </ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
            >
              {inventoryData.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryOption,
                    selectedCategory === category.name &&
                      styles.categoryOptionSelected,
                  ]}
                  onPress={() => setSelectedCategory(category.name)}
                >
                  <ThemedText
                    style={[
                      styles.categoryOptionText,
                      selectedCategory === category.name &&
                        styles.categoryOptionTextSelected,
                    ]}
                  >
                    {category.name}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <TouchableOpacity
            style={[
              styles.addButton,
              (!newItemName.trim() ||
                !newItemQuantity.trim() ||
                !newItemUnit.trim() ||
                !selectedCategory) &&
                styles.addButtonDisabled,
            ]}
            onPress={handleAddItem}
            disabled={
              !newItemName.trim() ||
              !newItemQuantity.trim() ||
              !newItemUnit.trim() ||
              !selectedCategory
            }
          >
            <IconSymbol name="plus" size={16} color="white" />
            <ThemedText style={styles.addButtonText}>
              {t("inventoryEdit.addItem")}
            </ThemedText>
          </TouchableOpacity>
        </>
      ),
    },
    {
      title: t("inventoryEdit.editItem"),
      isOpen: showEditItem,
      onToggle: () => {
        if (showEditItem) {
          setSelectedEditItemCategory("");
          setSelectedEditItem("");
          setEditItemName("");
          setEditItemPrice("");
        }
        setShowEditItem(!showEditItem);
      },
      renderContent: () => (
        <>
          {selectedEditItemCategory && (
            <View style={styles.breadcrumbContainer}>
              <Breadcrumb
                items={[
                  {
                    label: selectedEditItemCategory,
                    onPress: () => {
                      setSelectedEditItemCategory("");
                      setSelectedEditItem("");
                      setEditItemName("");
                      setEditItemPrice("");
                    },
                    showCloseIcon: true,
                  },
                  ...(selectedEditItem
                    ? [
                        {
                          label: selectedEditItem,
                          onPress: () => {
                            setSelectedEditItem("");
                            setEditItemName("");
                            setEditItemPrice("");
                          },
                          showCloseIcon: true,
                        },
                      ]
                    : []),
                ]}
              />
            </View>
          )}

          {!selectedEditItemCategory && (
            <View style={styles.categorySelector}>
              <ThemedText style={styles.selectorLabel}>
                {t("inventoryEdit.selectCategory")}
              </ThemedText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
              >
                {inventoryData.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={styles.categoryOption}
                    onPress={() => {
                      setSelectedEditItemCategory(category.name);
                      setSelectedEditItem("");
                      setEditItemName("");
                      setEditItemPrice("");
                    }}
                  >
                    <ThemedText style={styles.categoryOptionText}>
                      {category.name}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {selectedEditItemCategory && !selectedEditItem && (
            <View style={styles.itemSelector}>
              <ThemedText style={styles.selectorLabel}>
                {t("inventoryEdit.selectItemToEdit")}
              </ThemedText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.itemScroll}
              >
                {editCategoryItems.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.itemOption}
                    onPress={() => {
                      setSelectedEditItem(item.name);
                      setEditItemName(item.name);
                      setEditItemPrice(item.price?.toString() || "");
                    }}
                  >
                    <ThemedText style={styles.itemOptionText}>
                      {item.name}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {selectedEditItem && (
            <>
              <TextInput
                style={styles.input}
                placeholder={t("inventoryEdit.enterNewItemName")}
                placeholderTextColor="#999"
                value={editItemName}
                onChangeText={setEditItemName}
                autoCapitalize="words"
              />

              <TextInput
                style={styles.input}
                placeholder={t("inventoryEdit.enterNewPrice")}
                placeholderTextColor="#999"
                value={editItemPrice}
                onChangeText={setEditItemPrice}
                keyboardType="numeric"
              />

              <TouchableOpacity
                style={[
                  styles.addButton,
                  !editItemName.trim() && styles.addButtonDisabled,
                ]}
                onPress={handleEditItem}
                disabled={!editItemName.trim()}
              >
                <ThemedText style={styles.addButtonText}>
                  {t("inventoryEdit.updateItem")}
                </ThemedText>
              </TouchableOpacity>
            </>
          )}
        </>
      ),
    },
    {
      title: t("inventoryEdit.deleteItem"),
      isOpen: showDeleteItem,
      onToggle: () => {
        if (showDeleteItem) {
          setSelectedDeleteItemCategory("");
          setDeleteItemName("");
        }
        setShowDeleteItem(!showDeleteItem);
      },
      renderContent: () => (
        <>
          {selectedDeleteItemCategory && (
            <View style={styles.breadcrumbContainer}>
              <Breadcrumb
                items={[
                  {
                    label: selectedDeleteItemCategory,
                    onPress: () => {
                      setSelectedDeleteItemCategory("");
                      setDeleteItemName("");
                    },
                    showCloseIcon: true,
                  },
                ]}
              />
            </View>
          )}

          {!selectedDeleteItemCategory && (
            <View style={styles.categorySelector}>
              <ThemedText style={styles.selectorLabel}>
                {t("inventoryEdit.selectCategory")}
              </ThemedText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
              >
                {inventoryData.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={styles.categoryOption}
                    onPress={() => {
                      setSelectedDeleteItemCategory(category.name);
                      setDeleteItemName("");
                    }}
                  >
                    <ThemedText style={styles.categoryOptionText}>
                      {category.name}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {selectedDeleteItemCategory && (
            <>
              <TextInput
                style={styles.input}
                placeholder={t("inventoryEdit.enterExactItemName")}
                placeholderTextColor="#999"
                value={deleteItemName}
                onChangeText={setDeleteItemName}
                autoCapitalize="words"
              />

              <TouchableOpacity
                style={[
                  styles.deleteButton,
                  !deleteItemName.trim() && styles.deleteButtonDisabled,
                ]}
                onPress={handleDeleteItem}
                disabled={!deleteItemName.trim()}
              >
                <IconSymbol name="trash" size={16} color="white" />
                <ThemedText style={styles.deleteButtonText}>
                  {t("inventoryEdit.deleteItem")}
                </ThemedText>
              </TouchableOpacity>
            </>
          )}
        </>
      ),
    },
  ];

  // Label dropdown items
  const labelDropdownItems: DropdownItem[] = [
    {
      title: t("inventoryEdit.addNewLabel"),
      isOpen: showAddLabel,
      onToggle: () => setShowAddLabel(!showAddLabel),
      renderContent: () => (
        <>
          <TextInput
            style={styles.input}
            placeholder={t("inventoryEdit.labelNamePlaceholder")}
            placeholderTextColor="#999"
            value={newLabelName}
            onChangeText={setNewLabelName}
            autoCapitalize="words"
          />
          <TouchableOpacity
            style={[
              styles.addButton,
              !newLabelName.trim() && styles.addButtonDisabled,
            ]}
            onPress={handleAddLabel}
            disabled={!newLabelName.trim()}
          >
            <IconSymbol name="plus" size={16} color="white" />
            <ThemedText style={styles.addButtonText}>
              {t("inventoryEdit.addLabel")}
            </ThemedText>
          </TouchableOpacity>
        </>
      ),
    },
    {
      title: t("inventoryEdit.editLabel"),
      isOpen: showEditLabel,
      onToggle: () => {
        if (showEditLabel) {
          setSelectedEditLabel("");
          setEditLabelName("");
        }
        setShowEditLabel(!showEditLabel);
      },
      renderContent: () => (
        <>
          <View style={styles.categorySelector}>
            <ThemedText style={styles.selectorLabel}>
              {t("inventoryEdit.selectLabelToEdit")}
            </ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
            >
              {labelsData.map((label) => (
                <TouchableOpacity
                  key={label.id}
                  style={[
                    styles.categoryOption,
                    selectedEditLabel === label.name &&
                      styles.categoryOptionSelected,
                  ]}
                  onPress={() => setSelectedEditLabel(label.name)}
                >
                  <ThemedText
                    style={[
                      styles.categoryOptionText,
                      selectedEditLabel === label.name &&
                        styles.categoryOptionTextSelected,
                    ]}
                  >
                    {label.name}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <TextInput
            style={styles.input}
            placeholder={t("inventoryEdit.enterNewLabelName")}
            placeholderTextColor="#999"
            value={editLabelName}
            onChangeText={setEditLabelName}
            autoCapitalize="words"
          />

          <TouchableOpacity
            style={[
              styles.addButton,
              (!selectedEditLabel || !editLabelName.trim()) &&
                styles.addButtonDisabled,
            ]}
            onPress={handleEditLabel}
            disabled={!selectedEditLabel || !editLabelName.trim()}
          >
            <ThemedText style={styles.addButtonText}>
              {t("inventoryEdit.updateLabel")}
            </ThemedText>
          </TouchableOpacity>
        </>
      ),
    },
    {
      title: t("inventoryEdit.deleteLabel"),
      isOpen: showDeleteLabel,
      onToggle: () => setShowDeleteLabel(!showDeleteLabel),
      renderContent: () => (
        <>
          <TextInput
            style={styles.input}
            placeholder={t("inventoryEdit.enterExactLabelName")}
            placeholderTextColor="#999"
            value={deleteLabelName}
            onChangeText={setDeleteLabelName}
            autoCapitalize="words"
          />

          <TouchableOpacity
            style={[
              styles.deleteButton,
              !deleteLabelName.trim() && styles.deleteButtonDisabled,
            ]}
            onPress={handleDeleteLabel}
            disabled={!deleteLabelName.trim()}
          >
            <IconSymbol name="trash" size={16} color="white" />
            <ThemedText style={styles.deleteButtonText}>
              {t("inventoryEdit.deleteLabel")}
            </ThemedText>
          </TouchableOpacity>
        </>
      ),
    },
  ];

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          {t("inventoryEdit.updateTab")}
        </ThemedText>
      </View>

      {/* Content */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 20}
      >
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.editContainer}>
            {/* Category Section */}
            <EditSection
              title={t("inventoryEdit.categorySection")}
              dropdownItems={categoryDropdownItems}
              isExpanded={isCategorySectionExpanded}
              onToggleExpanded={() =>
                setIsCategorySectionExpanded(!isCategorySectionExpanded)
              }
            />

            {/* Item Section - Only show if at least one category exists */}
            {inventoryData.length > 0 && (
              <EditSection
                title={t("inventoryEdit.itemSection")}
                dropdownItems={itemDropdownItems}
                isExpanded={isItemsSectionExpanded}
                onToggleExpanded={() =>
                  setIsItemsSectionExpanded(!isItemsSectionExpanded)
                }
              />
            )}

            {/* Label Section - Always visible */}
            <EditSection
              title={t("inventoryEdit.labelSection")}
              dropdownItems={labelDropdownItems}
              isExpanded={isLabelsSectionExpanded}
              onToggleExpanded={() =>
                setIsLabelsSectionExpanded(!isLabelsSectionExpanded)
              }
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Admin-only overlay */}
      {!isAdmin && (
        <>
          <View style={styles.overlay} pointerEvents="box-only" />
          <View style={styles.adminInfoCard} pointerEvents="none">
            <ThemedText style={styles.adminInfoText}>
              {t("inventoryEdit.adminOnly")}
            </ThemedText>
          </View>
        </>
      )}

      {/* Manual Entry Modal */}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(128, 128, 128, 0.6)",
    zIndex: 999,
  },
  adminInfoCard: {
    position: "absolute",
    bottom: 0,
    left: 20,
    right: 20,
    transform: [{ translateY: -50 }],
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 36,
    borderWidth: 2,
    borderColor: "#ADD8E6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  adminInfoText: {
    fontSize: 16,
    lineHeight: 22,
    color: "#333",
    textAlign: "center",
    fontWeight: "600",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  editContainer: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E1E5E9",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "white",
    marginBottom: 12,
    color: "#000",
  },
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inputHalf: {
    flex: 1,
    marginRight: 8,
  },
  addButton: {
    backgroundColor: "#007AFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addButtonDisabled: {
    backgroundColor: "#A0A0A0",
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  breadcrumbContainer: {
    marginBottom: 12,
    paddingVertical: 4,
  },
  categorySelector: {
    marginBottom: 12,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  categoryScroll: {
    maxHeight: 50,
  },
  categoryOption: {
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E5E5E7",
  },
  categoryOptionSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  categoryOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  categoryOptionTextSelected: {
    color: "white",
  },
  itemSelector: {
    marginBottom: 12,
  },
  itemScroll: {
    maxHeight: 200,
  },
  itemOption: {
    backgroundColor: "#F8F9FA",
    padding: 12,
    marginBottom: 8,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5E7",
  },
  itemOptionSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  itemOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  itemOptionTextSelected: {
    color: "white",
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  deleteButtonDisabled: {
    backgroundColor: "#A0A0A0",
  },
  deleteButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  manualEntryButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: "center",
  },
  manualEntryButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  manualEntryButtonDisabled: {
    backgroundColor: "#A0A0A0",
    opacity: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    width: "90%",
    maxHeight: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  modalCloseButton: {
    padding: 8,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E7",
  },
  toggleContainerBuying: {
    backgroundColor: "#FFE0E0",
    borderColor: "#FFB3B3",
  },
  toggleContainerSelling: {
    backgroundColor: "#E0F5E0",
    borderColor: "#B3E6B3",
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  modalScroll: {
    maxHeight: 60,
  },
  modalOption: {
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#E5E5E7",
  },
  modalOptionSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  modalOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  modalOptionTextSelected: {
    color: "white",
  },
  modalSubmitButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  modalSubmitButtonDisabled: {
    backgroundColor: "#A0A0A0",
  },
  modalSubmitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 12,
  },
  quantityButton: {
    backgroundColor: "#007AFF",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityButtonDisabled: {
    backgroundColor: "#A0A0A0",
  },
  quantityButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  quantityDisplay: {
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5E7",
    minWidth: 60,
    alignItems: "center",
  },
  quantityText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  sliderHelpText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },
});
