import React, { useState } from 'react';
import { 
  View, StyleSheet, Modal, Text, TouchableOpacity, TextInput, 
  ScrollView, Alert, Platform, ActivityIndicator
} from 'react-native';
import { X, ChevronDown, Upload, Check, AlertCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { createEntry } from '@/services/firestore/entries.service';
import { getAllUniverses } from '@/services/firestore/universes.service';
import { collection, doc } from 'firebase/firestore';
import { firestore } from '@/config/firebase';

interface CreateEntryModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type WorkType = 'original' | 'inspired' | null;

// Predefined universes for Inspired By
const INSPIRED_UNIVERSES = [
  { id: '1', name: 'DC Universe' },
  { id: '2', name: 'Marvel Universe' },
  { id: '3', name: 'Star Trek Universe' },
  { id: '4', name: 'Star Wars Universe' },
  { id: '5', name: 'Transformers Universe' },
  { id: '6', name: 'GI Joe Universe' },
  { id: '7', name: 'Harry Potter Universe' },
  { id: '8', name: 'Lord of the Rings Universe' },
  { id: '9', name: 'Blade Runner Universe' },
  { id: '10', name: 'The Matrix Universe' },
  { id: '11', name: 'Alien Universe' },
  { id: '12', name: 'Terminator Universe' },
  { id: '13', name: 'Jurassic Park Universe' },
  { id: '14', name: 'Back to the Future Universe' },
  { id: '15', name: 'Ghostbusters Universe' },
];

export default function CreateEntryModal({ visible, onClose, onSuccess }: CreateEntryModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [workType, setWorkType] = useState<WorkType>(null);
  const [selectedUniverse, setSelectedUniverse] = useState<string>('');
  const [originalUniverseName, setOriginalUniverseName] = useState<string>('');
  const [showUniverseDropdown, setShowUniverseDropdown] = useState(false);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [source, setSource] = useState('');
  const [content, setContent] = useState('');
  const [hasAgreed, setHasAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [universes, setUniverses] = useState<any[]>([]);

  const resetForm = () => {
    setStep(1);
    setWorkType(null);
    setSelectedUniverse('');
    setOriginalUniverseName('');
    setShowUniverseDropdown(false);
    setTitle('');
    setAuthor('');
    setSource('');
    setContent('');
    setHasAgreed(false);
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleWorkTypeSelect = (type: WorkType) => {
    setWorkType(type);
    setSelectedUniverse('');
    setOriginalUniverseName('');
    setStep(2);
  };

  const handleUniverseSelect = (universe: string) => {
    if (universe === '+ CREATE NEW UNIVERSE') {
      setSelectedUniverse('new');
    } else {
      setSelectedUniverse(universe);
    }
    setShowUniverseDropdown(false);
    setStep(3);
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be signed in to create an entry.');
      return;
    }

    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title.');
      return;
    }
    if (!author.trim()) {
      Alert.alert('Error', 'Please enter the author name.');
      return;
    }
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter your content.');
      return;
    }
    if (workType === 'inspired' && !source.trim()) {
      Alert.alert('Error', 'Source is required for Inspired By submissions.');
      return;
    }
    if (!hasAgreed) {
      Alert.alert('Error', 'You must agree to the terms to submit.');
      return;
    }

    setLoading(true);

    try {
      const universeName = workType === 'original' 
        ? (selectedUniverse === 'new' ? originalUniverseName : selectedUniverse)
        : selectedUniverse;

      const entryId = doc(collection(firestore, 'entries')).id;
      
      await createEntry(entryId, {
        title,
        description: content.substring(0, 200),
        content,
        universe: universeName,
        type: workType === 'original' ? 'original' : 'inspired',
        universeType: workType === 'original' ? 'original' : 'inspired',
        source: workType === 'inspired' ? source : undefined,
        tags: [],
      });

      Alert.alert(
        'Submission Successful!',
        'Your entry has been submitted and is pending approval. You will be notified once it\'s approved.',
        [{ text: 'OK', onPress: () => {
          resetForm();
          onSuccess();
        }}]
      );
    } catch (error: any) {
      Alert.alert('Submission Failed', error.message || 'Failed to create entry');
    } finally {
      setLoading(false);
    }
  };

  const getUniverseList = () => {
    if (workType === 'inspired') {
      return INSPIRED_UNIVERSES;
    }
    return [
      ...universes.map(u => ({ id: u.id, name: u.name })),
      { id: 'new', name: '+ CREATE NEW UNIVERSE' },
    ];
  };

  const getSelectedUniverseName = () => {
    if (selectedUniverse === 'new') {
      return originalUniverseName || 'New Universe';
    }
    const list = getUniverseList();
    const found = list.find(u => u.name === selectedUniverse);
    return found?.name || 'Select Universe...';
  };

  React.useEffect(() => {
    if (workType === 'original' && visible) {
      getAllUniverses().then(setUniverses).catch(console.error);
    }
  }, [workType, visible]);

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>WHAT TYPE OF WORK?</Text>
      <Text style={styles.stepSubtitle}>Choose the category for your submission</Text>

      <TouchableOpacity 
        style={[styles.typeButton, workType === 'original' && styles.typeButtonActive]}
        onPress={() => handleWorkTypeSelect('original')}
      >
        <Text style={[styles.typeButtonTitle, workType === 'original' && styles.typeButtonTitleActive]}>
          ORIGINAL WORK
        </Text>
        <Text style={styles.typeButtonDesc}>
          Your own unique creation and universe
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.typeButton, styles.typeButtonInspired, workType === 'inspired' && styles.typeButtonInspiredActive]}
        onPress={() => handleWorkTypeSelect('inspired')}
      >
        <Text style={[styles.typeButtonTitle, styles.typeButtonTitleInspired, workType === 'inspired' && styles.typeButtonTitleActive]}>
          INSPIRED BY
        </Text>
        <Text style={styles.typeButtonDesc}>
          Based on an existing universe or franchise
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>
        {workType === 'original' ? 'SELECT OR CREATE UNIVERSE' : 'SELECT UNIVERSE'}
      </Text>
      <Text style={styles.stepSubtitle}>
        {workType === 'original' 
          ? 'Choose an existing original universe or create a new one'
          : 'Select the universe that inspired your work'}
      </Text>

      <TouchableOpacity 
        style={styles.dropdownButton}
        onPress={() => setShowUniverseDropdown(!showUniverseDropdown)}
      >
        <Text style={styles.dropdownButtonText}>
          {selectedUniverse ? getSelectedUniverseName() : 'Select Universe...'}
        </Text>
        <ChevronDown size={20} color={Colors.cyan} />
      </TouchableOpacity>

      {showUniverseDropdown && (
        <ScrollView style={styles.dropdownList} nestedScrollEnabled>
          {getUniverseList().map((universe) => (
            <TouchableOpacity
              key={universe.id}
              style={styles.dropdownItem}
              onPress={() => handleUniverseSelect(universe.name)}
            >
              <Text style={[
                styles.dropdownItemText,
                universe.name === '+ CREATE NEW UNIVERSE' && styles.dropdownItemNew
              ]}>
                {universe.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {selectedUniverse === 'new' && (
        <View style={styles.newUniverseInput}>
          <Text style={styles.inputLabel}>NEW UNIVERSE NAME</Text>
          <TextInput
            style={styles.input}
            value={originalUniverseName}
            onChangeText={setOriginalUniverseName}
            placeholder="Enter your universe name..."
            placeholderTextColor={Colors.textMuted}
          />
        </View>
      )}

      {(selectedUniverse && selectedUniverse !== 'new') || (selectedUniverse === 'new' && originalUniverseName) ? (
        <TouchableOpacity 
          style={styles.continueButton}
          onPress={() => setStep(3)}
        >
          <Text style={styles.continueButtonText}>CONTINUE</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );

  const renderStep3 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>ENTRY DETAILS</Text>
      <Text style={styles.stepSubtitle}>Fill in the information for your submission</Text>

      <Text style={styles.inputLabel}>TITLE *</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Enter title..."
        placeholderTextColor={Colors.textMuted}
      />

      <Text style={styles.inputLabel}>AUTHOR *</Text>
      <TextInput
        style={styles.input}
        value={author}
        onChangeText={setAuthor}
        placeholder="Enter author name..."
        placeholderTextColor={Colors.textMuted}
      />

      <Text style={styles.inputLabel}>
        SOURCE {workType === 'inspired' ? '*' : '(Optional)'}
      </Text>
      <TextInput
        style={[styles.input, styles.inputMultiline]}
        value={source}
        onChangeText={setSource}
        placeholder={workType === 'inspired' 
          ? "Where did you get your information/inspiration from?..."
          : "Optional: Reference any sources..."
        }
        placeholderTextColor={Colors.textMuted}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />

      <Text style={styles.inputLabel}>CONTENT *</Text>
      <TextInput
        style={[styles.input, styles.inputMultiline]}
        value={content}
        onChangeText={setContent}
        placeholder="Write your content here..."
        placeholderTextColor={Colors.textMuted}
        multiline
        numberOfLines={8}
        textAlignVertical="top"
      />

      <TouchableOpacity 
        style={styles.continueButton}
        onPress={() => setStep(4)}
        disabled={!title.trim() || !author.trim() || !content.trim() || (workType === 'inspired' && !source.trim())}
      >
        <Text style={styles.continueButtonText}>REVIEW & SUBMIT</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderStep4 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>AGREEMENT</Text>
      
      <View style={styles.disclaimerBox}>
        <AlertCircle size={24} color={Colors.amber} style={styles.disclaimerIcon} />
        
        {workType === 'original' ? (
          <>
            <Text style={styles.disclaimerTitle}>ORIGINAL WORK REQUIREMENTS</Text>
            <Text style={styles.disclaimerText}>
              For a submission to be considered an <Text style={styles.disclaimerHighlight}>Original Work</Text>, 
              it must meet the following criteria:{'\n\n'}
              
              • The work must be derived from <Text style={styles.disclaimerHighlight}>you</Text>, not from an 
              AI-generated source{'\n\n'}
              
              • At least <Text style={styles.disclaimerHighlight}>95%</Text> of the content must be your own 
              original creation{'\n\n'}
              
              • No more than <Text style={styles.disclaimerHighlight}>5%</Text> may contain vague references 
              to existing universes (Star Trek, Marvel, DC, etc.){'\n\n'}
              
              <Text style={styles.disclaimerWarning}>
                WARNING: If your work is reviewed by our team and found to contain more than 5% content 
                related to existing works, your submission will be rejected and you will need to resubmit 
                it under "Inspired By" instead.
              </Text>
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.disclaimerTitle}>INSPIRED BY REQUIREMENTS</Text>
            <Text style={styles.disclaimerText}>
              For a submission to be considered <Text style={styles.disclaimerHighlight}>Inspired By</Text> work, 
              it must meet the following criteria:{'\n\n'}
              
              • At least <Text style={styles.disclaimerHighlight}>90%</Text> of the content must be your own 
              original writing{'\n\n'}
              
              • No more than <Text style={styles.disclaimerHighlight}>10%</Text> may be directly derived from 
              the source material or franchise{'\n\n'}
              
              • You must properly credit the original universe/franchise{'\n\n'}
              
              • You must provide the source of your inspiration{'\n\n'}
              
              <Text style={styles.disclaimerWarning}>
                NOTE: This is fan fiction and derivative work. You do not own the rights to the original 
                universe. Your work will be clearly labeled as "Inspired By" content.
              </Text>
            </Text>
          </>
        )}
      </View>

      <TouchableOpacity 
        style={styles.agreeButton}
        onPress={() => setHasAgreed(!hasAgreed)}
      >
        <View style={[styles.checkbox, hasAgreed && styles.checkboxChecked]}>
          {hasAgreed && <Check size={16} color="#000" />}
        </View>
        <Text style={styles.agreeText}>
          I have read and agree to the above requirements. My submission meets these criteria.
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.submitButton, !hasAgreed && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={!hasAgreed || loading}
      >
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={[styles.submitButtonText, !hasAgreed && styles.submitButtonTextDisabled]}>
            SUBMIT ENTRY
          </Text>
        )}
      </TouchableOpacity>

      {!hasAgreed && (
        <Text style={styles.submitHint}>
          You must agree to the requirements to submit
        </Text>
      )}
    </ScrollView>
  );

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3, 4].map((s) => (
        <View 
          key={s} 
          style={[
            styles.stepDot,
            step >= s && styles.stepDotActive,
            step === s && styles.stepDotCurrent
          ]} 
        />
      ))}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => step > 1 ? setStep(step - 1) : handleClose()}
            >
              <Text style={styles.backButtonText}>
                {step > 1 ? '← BACK' : 'CANCEL'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>CREATE ENTRY</Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <X size={24} color={Colors.cyan} />
            </TouchableOpacity>
          </View>

          {renderStepIndicator()}

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.bgDeepBlue,
    borderTopWidth: 2,
    borderTopColor: Colors.cyan,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderLeftColor: Colors.cyan,
    borderRightColor: Colors.cyan,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.cyan,
    letterSpacing: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.cyan,
    letterSpacing: 2,
  },
  closeButton: {
    padding: 8,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.cardBorder,
  },
  stepDotActive: {
    backgroundColor: Colors.cyan,
  },
  stepDotCurrent: {
    width: 24,
    borderRadius: 4,
  },
  stepContent: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.cyan,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
  typeButton: {
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.cyan,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    marginBottom: 16,
  },
  typeButtonActive: {
    backgroundColor: Colors.cyan,
  },
  typeButtonInspired: {
    borderColor: Colors.amber,
    backgroundColor: 'rgba(255, 174, 0, 0.1)',
  },
  typeButtonInspiredActive: {
    backgroundColor: Colors.amber,
  },
  typeButtonTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.cyan,
    letterSpacing: 2,
    marginBottom: 6,
  },
  typeButtonTitleInspired: {
    color: Colors.amber,
  },
  typeButtonTitleActive: {
    color: '#000',
  },
  typeButtonDesc: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.inputBorder,
    backgroundColor: Colors.inputBg,
    marginBottom: 16,
  },
  dropdownButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  dropdownList: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.cardBg,
    marginBottom: 16,
  },
  dropdownItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  dropdownItemNew: {
    color: Colors.cyan,
    fontWeight: '700',
  },
  newUniverseInput: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: Colors.inputBg,
    borderWidth: 2,
    borderColor: Colors.inputBorder,
    padding: 14,
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  inputMultiline: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  continueButton: {
    backgroundColor: Colors.cyan,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  continueButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 2,
  },
  disclaimerBox: {
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.amber,
    backgroundColor: 'rgba(255, 174, 0, 0.1)',
    marginBottom: 20,
  },
  disclaimerIcon: {
    alignSelf: 'center',
    marginBottom: 12,
  },
  disclaimerTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.amber,
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 12,
  },
  disclaimerText: {
    fontSize: 13,
    color: Colors.white,
    lineHeight: 20,
  },
  disclaimerHighlight: {
    color: Colors.cyan,
    fontWeight: '700',
  },
  disclaimerWarning: {
    color: Colors.amber,
    fontWeight: '600',
    fontStyle: 'italic',
  },
  agreeButton: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: Colors.cyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.cyan,
  },
  agreeText: {
    flex: 1,
    fontSize: 13,
    color: Colors.white,
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: Colors.cyan,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: Colors.cardBorder,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 2,
  },
  submitButtonTextDisabled: {
    color: Colors.textMuted,
  },
  submitHint: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 12,
  },
});